const ws = require('ws');

const wss = new ws.WebSocketServer({ port: 80 });
const clients = {};
var id = 0
wss.on('connection', (ws) => {
    client_id = id++;
    clients[client_id] = ws;
    console.log(`Client ${id} connected`);
    ws.on('message', (message) => {
        
    });
    ws.on('close', () => {
        delete client[client_id];
        console.log(`Client ${id} disconnected`);
    });
});