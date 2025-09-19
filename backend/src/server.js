/*
server possibilities
data types: 'channel', 'message', 'user', 'userchannels'
users and channels names are unique!
sample of success response data:
{
    type: 'channel',
    authorName: '*user name*',
    data: {
        name: '*unique channel name*',
        messages: [...]
    },
}
sample of error response data:
{
    type: 'channel',
    authorName: '*user name*'
    error: {
        message: 'this name is already exist',
    },
}
*/

const ws = require('ws');

const bodyTypeScripts = { 
    'channel': doChannel,
    'user': doUser,
    'userchannels': doUserChannels,
    'message': doAppendMessage,
};


const wss = new ws.WebSocketServer({ port: 80 });
const users = {};
const channels = {};
/**
 * list of client
 * @param {string|null} username - client log in username
 * @param {ws.WebSocketServer} socket - client socket
 */
const clients = {};
function initClientUser(clientId, username) {
    clients[clientId].username = username;
}
/**
 * finds user in user list or push a new
 * @param clientId - request client id 
 * @param body - request body (type: 'user', username: *unique user name*, channelName: *unique channel name*)
 * @returns response body with channel data
 */
function doChannel(clientId, body) {
    if (body.type !== 'channel') {
        throw Error("broken body type"); // server side error
    }
    if (!channels[body.channelName]) { // create a new channel
        channels[body.channelName] = {
            name: body.channelName,
            members: [body.username],
            authorName: body.username,
            messages: [],
        };
        const user = users[body.username];
        if (user) {
            user.channels.push(body.channelName);
        }
    }
    else if (channels[body.channelName].members.every(membername => membername !== body.username)) { 
        // join channel member 
        channels[body.channelName].members.push(body.username);
    }
    return [[clientId], {...body, data: channels[body.channelName]}]
}
/**
 * finds user in user list or push a new
 * @param clientId - request author 
 * @param body - request body (type: 'user', username: *unique user name*)
 * @returns response clients to send list and body with user and ids of channels data
 */
function doUser(clientId, body) {
    if (body.type !== 'user') {
        throw Error("broken body type"); // server side error
    }
    let user = { name: body.username, channels: [] };
    if (users[body.username]) {
        user = users[user.name];
    }
    else {
        users.push(user);
    }
    return [[clientId], {type: 'user', data: user }];
}
/**
 * finds all data about user channels in server list
 * @param clientId - request author 
 * @param body - request body (type: 'userchannels', username: *unique user name*)
 * @returns response body with initialized data about user channels
 */
function doUserChannels(clientId, body) {
    if (body.type !== 'userchannels') {
        throw Error("broken body type"); // server side error
    }
    let result = { type: 'userchannels', username: body.username };
    const user = users[body.username];
    if (!user) {
        return [[clientId], {...result, error: {message: 'user does not exist.'}}];
    }
    result.data.channels = [];
    for (const channelName in user.channels) {
        const channelInstance = channels.find((channel) => channelName === channel.name);
        const truncatedData = {name: channelInstance.name, lastMessage: channelInstance.messages[channelInstance.messages.length - 1]};
        if (channelInstance !== undefined) { // push the found channel to result
            result.data.channels.push(truncatedData);
        }
        else { // add a warning to result if channel not found
            result.warn = result.warn ?? {};
            result.warn.channelNotFound = result.warn.channel_not_found ?? [];
            result.warn.channelNotFound.push(channelName);
        }
    }
    return [[clientId], result];
}
/**
 * appends/searching the message in the channel chat
 * @param clientId - request author 
 * @param body - request body (type: 'message', username: *unique user name*, channelName: *unique channel name*, data: {text: *message text*})
 * @returns response body with message data
 */
function doMessage(clientId, body) {
    if (body.type !== 'message') {
        throw Error("broken body type"); // server side error
    }
    if (channels[body.channelName] === undefined) {
        return [[clientId], {...body, error: {message: 'failed to message. unknown channel.'}}];
    }
    const channel = channels[body.channelName];
    // try to search the message
    if (body.searchFilters) { // if body contains find attr then find and return message
        const filter = body.searchFilters;
        if (Object.keys(filter).length === 0) {
            // search message by same value
            const message = channels.messages.find(msg => {
                const result = true;
                for (const key in Object.keys(msg)) {
                    if (filter[key] !== undefined) {
                        result = result && filter[key] === message[key];
                    }
                }
                return result;
            });
            if (message) {
                return [[clientId], {...body, data: message}]; // message found
            } else {
                return [[clientId], {...body, error: {message: 'No messages not was found.'}}];
            }
        }
        else {
            return [[clientId], {...body, error: {message: 'No filters.'}}]
        }
    }
    // pushing new message
    channel.messages.push({authorName: username, text: body.data.text});
    // choosing channel member clients
    let idsChannelClients = [];
    for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        const membername = channel.members.find(membername => membername === client.username);
        if (membername !== undefined) {
            idsChannelClients.push(client);
        }
    }
    return [[idsChannelClients], body];
}
wss.on('connection', (ws) => {
    const clientId = Object.keys(clients).length;
    clients[clientId] = {username: null, socket: ws};
    console.log(`Client ${clientId} connected`);
    ws.on('message', (rawMessageInstance, isBinary) => {
        const messageInstance = JSON.parse(isBinary ? rawMessageInstance : rawMessageInstance.toString());
        console.log(messageInstance);
        initClientUser(clientId, messageInstance.username);
        const [listClientIds, response] = bodyTypeScripts[messageInstance.type](clientId, messageInstance);
        for (const _clientId in listClientIds) {
            clients[_clientId].socket.send(JSON.stringify(response));
        }
    });
    ws.on('close', () => {
        delete clients[clientId];
        console.log(`Client ${clientId} disconnected`);
    });
});