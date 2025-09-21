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
const {doUser} = require('./doUser');
const {doChannel} = require('./doChannel');
const {doRemoveMember} = require('./doRemoveMember');
const {doUserChannels} = require('./doUserChannels');
const {doMessage} = require('./doMessage');
const {initClientUser} = require('./tools');
const {clients, channels, users} = require('./globals');

const ws = require('ws');
const uuid = require('uuid').v4;

const requestActions = { 
    'channel': doChannel,
    'user': doUser,
    'userchannels': doUserChannels,
    'message': doMessage,
    'removemember': doRemoveMember,
};
const wss = new ws.WebSocketServer({ port: 80 });


wss.on('connection', (ws) => {
    const clientId = uuid();
    clients[clientId] = {username: null, socket: ws};
    console.log(`Client ${clientId} connected`);
    ws.on('message', (rawMessageInstance, isBinary) => {
        const messageInstance = JSON.parse(isBinary ? rawMessageInstance : rawMessageInstance.toString());
        console.log(messageInstance);
        initClientUser(clientId, messageInstance.username);
        if (!requestActions[messageInstance.type]) {
            clients[clientId].socket.send(JSON.stringify({error: {message: `unknown body type '${messageInstance.type}'.`}}));
            return;
        }
        const [listClientIds, response] = requestActions[messageInstance.type](clientId, messageInstance);
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