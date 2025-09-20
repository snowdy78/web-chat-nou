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
const uuid = require('uuid').v4;

const bodyTypeScripts = { 
    'channel': doChannel,
    'user': doUser,
    'userchannels': doUserChannels,
    'message': doMessage,
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
        users[user.name] = user;
    }
    clients[clientId].username = body.username;
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
    let result = { ...body };
    const user = users[body.username];
    if (!user) {
        return [[clientId], {...result, error: {message: 'user does not exist.'}}];
    }
    result.data = {};
    result.data.channels = [];
    for (const i in user.channels) {
        const channel = channels[user.channels[i]];
        if (channel) {
            const truncatedData = {name: channel.name, lastMessage: channel.messages[channel.messages.length - 1]};
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
    channel.messages.push({authorName: body.username, text: body.data.text});
    // choosing channel member clients
    let channelMembersIdsOfClients = [];
    for (const cid in clients) {
        const membername = channel.members.find(membername => membername === clients[cid].username);
        if (membername !== undefined) {
            channelMembersIdsOfClients.push(cid);
        }
    }
    return [channelMembersIdsOfClients, body];
}
wss.on('connection', (ws) => {
    const clientId = uuid();
    clients[clientId] = {username: null, socket: ws};
    console.log(`Client ${clientId} connected`);
    ws.on('message', (rawMessageInstance, isBinary) => {
        const messageInstance = JSON.parse(isBinary ? rawMessageInstance : rawMessageInstance.toString());
        console.log(messageInstance);
        initClientUser(clientId, messageInstance.username);
        if (!bodyTypeScripts[messageInstance.type]) {
            clients[clientId].socket.send(JSON.stringify({error: {message: `unknown body type '${messageInstance.type}'.`}}));
            return;
        }
        const [listClientIds, response] = bodyTypeScripts[messageInstance.type](clientId, messageInstance);
        console.log(response);
        for (const i in listClientIds) {
            console.log(`sending... `, listClientIds[i]);
            clients[listClientIds[i]].socket.send(JSON.stringify(response));
        }
    });
    ws.on('close', () => {
        delete clients[clientId];
        console.log(`Client ${clientId} disconnected`);
    });
});