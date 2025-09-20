

const users = {};
const channels = {};
/**
 * list of client
 * @param {string|null} username - client log in username
 * @param {ws.WebSocketServer} socket - client socket
 */
const clients = {};

module.exports = {
    users, channels, clients
};