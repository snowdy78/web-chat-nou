const {clients, channels, users} = require('./globals');
/**
 * 
 * @param {string} channelName - channel name
 * @returns list ids of clients -- member of the channel 
 */
function getChannelClientMembers(channelName) {
    const channel = channels[channelName];
    let channelMembersIdsOfClients = [];
    for (const cid in clients) {
        const membername = channel.members.find(membername => membername === clients[cid].username);
        if (membername !== undefined) {
            channelMembersIdsOfClients.push(cid);
        }
    }
    return channelMembersIdsOfClients;
}

function initClientUser(clientId, username) {
    clients[clientId].username = username;
}

module.exports = {
    getChannelClientMembers,
    initClientUser,
};
