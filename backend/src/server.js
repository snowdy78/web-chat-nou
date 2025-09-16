const ws = require('ws');

const wss = new ws.WebSocketServer({ port: 80 });
// TODO channels
const clients = {};
const messages = []; 
var id = 0
wss.on('connection', (ws) => {
    client_id = id++;
    clients[client_id] = ws;
    console.log(`Client ${id} connected`);
    ws.on('message', (rawMessageInstance, isBinary) => {
        const messageInstance = JSON.parse(isBinary ? rawMessageInstance : rawMessageInstance.toString());
        const message = messageInstance.message;
        console.log(message);
        messages.push(messageInstance);
        for (const id in clients) {
            clients[id].send(JSON.stringify([{message, own: false}]))
        }
    });
    ws.on('close', () => {
        delete clients[client_id];
        console.log(`Client ${client_id} disconnected`);
    });
});