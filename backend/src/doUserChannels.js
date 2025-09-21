const {clients, channels, users} = require('./globals');
/**
 * finds all data about user channels in server list
 * @param clientId - request author 
 * @param body - request body (type: 'userchannels', username: *unique user name*)
 * @returns response body with initialized data about user channels
 */
function doUserChannels(clientId, body) {
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

module.exports = {
    doUserChannels,
};
