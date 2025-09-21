const {clients, channels, users} = require('./globals');
const {getChannelClientMembers} = require('./tools');
/**
 * removes channel member
 * @param clientId - request client id
 * @param body - request body (type: 'removemember', username: *unique user name*, membername: *unique removing member name*, channelName: *unique channel name*)
 * @returns response body with 'error' state or requiest body. Adds new channel author if it removed
 */
function doRemoveMember(clientId, body) {
    const channel = channels[body.channelName];
    if (!channel) {
        return [[clientId], {...body, error: {message: 'Channel not found.'}}];
    }
    const user = users[body.username];
    if (!user) {
        return [[clientId], {...body, error: {message: 'User not found.'}}];
    }
    const memberIndex = channel.members.findIndex(membername => membername === body.membername);
    if (memberIndex === -1) {
        return [[clientId], {...body, error: {message: 'Member not found.'}}];
    }
    if (user.name !== channel.authorName) {
        return [[clientId], {...body, error: {message: 'Access denied.'}}];
    }
    const channelRemove = users[body.membername].channels.findIndex(cnl => cnl.name === channel.name);
    const clientIds = getChannelClientMembers(channel.name);
    users[body.membername].channels.splice(channelRemove, 1);
    channels[channel.name].members.splice(memberIndex, 1);
    // if channel author removing yourself set channel author to first member after previous author
    if (body.membername === user.name) { 
        // set null if already no channel members
        const newAuthor = channels[channel.name].members[0] ?? null; 
        channels[channel.name].authorName = newAuthor;
        // add new author to response
        body.newAuthor = newAuthor;
    }
    return [clientIds, {...body}];
}

module.exports = {
    doRemoveMember,
};
