const {clients, channels, users} = require('./globals');
const {getChannelClientMembers} = require('./tools');
/**
 * removes channel member
 * @param clientId - request client id
 * @param body - request body (type: 'removemember', username: *unique user name*, membername: *unique removing member name*, channelName: *unique channel name*)
 * @returns response body with 'success' or 'error' state
 */
function doRemoveMember(clientId, body) {
    const channel = channels[body.channelName];
    if (!channel) {
        return [[clientId], {...body, error: {message: 'Channel not found.'}}];
    }
    const memberIndex = channel.members.findIndex(membername => membername === body.membername);
    if (memberIndex === -1) {
        return [[clientId], {...body, error: {message: 'Member not found.'}}];
    }
    const user = users[body.username];
    if (!user) {
        return [[clientId], {...body, error: {message: 'User not found.'}}];
    }
    console.log(user.name === body.membername, user.name !== channel.authorName);
    if (user.name === body.membername || user.name !== channel.authorName) {
        return [[clientId], {...body, error: {message: 'Access denied.'}}];
    }
    const channelRemove = users[body.membername].channels.findIndex(cnl => cnl.name === channel.name);
    users[body.membername].channels.slice(channelRemove, 1);
    channels[channel.name].members.slice(memberIndex, 1);
    const clientIds = getChannelClientMembers(channel.name);
    return [clientIds, {...body, success: true}];
}

module.exports = {
    doRemoveMember,
};
