const {clients, channels, users} = require('./globals');
const {getChannelClientMembers} = require('./tools');
/**
 * finds user in user list or push a new
 * @param clientId - request client id 
 * @param body - request body (type: 'user', username: *unique user name*, channelName: *unique channel name*)
 * @returns response body with channel data
 */
function doChannel(clientId, body) {
    const user = users[body.username];
    if (!user) {
        return [[clientId], {...body, error: {message: 'user not found.'}}];
    }
    const channel = channels[body.channelName];
    if (!channel) { // create a new channel
        channels[body.channelName] = {
            name: body.channelName,
            members: [body.username],
            authorName: body.username,
            messages: [],
        };
        user.channels.push(body.channelName);
    }
    else if (channel.members.every(membername => membername !== body.username)) { 
        // join channel member 
        channel.members.push(body.username);
        // add channel to user channels
        user.channels.push(body.channelName);
        const clientIds = getChannelClientMembers(channel.name);
        return [clientIds, {...body, data: channels[body.channelName]}];
    }
    return [[clientId], {...body, data: channels[body.channelName]}]
}

module.exports = {
    doChannel,
};
