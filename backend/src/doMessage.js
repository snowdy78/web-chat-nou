const {clients, channels, users} = require('./globals');
const {getChannelClientMembers} = require('./tools');
/**
 * appends/searching the message in the channel chat
 * @param clientId - request author 
 * @param body - request body (type: 'message', username: *unique user name*, channelName: *unique channel name*, data: {text: *message text*})
 * @returns response body with message data
 */
function doMessage(clientId, body) {
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
    const message = {authorName: body.username, text: body.data.text};
    channel.messages.push(message);
    // choosing channel member clients
    const channelMembersIdsOfClients = getChannelClientMembers(channel.name);
    return [channelMembersIdsOfClients, {...body, data: message}];
}

module.exports = {
    doMessage,
};
