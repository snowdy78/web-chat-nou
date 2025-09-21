const {clients, channels, users} = require('./globals');
/**
 * finds user in user list or push a new
 * @param clientId - request author 
 * @param body - request body (type: 'user', username: *unique user name*)
 * @returns response clients to send list and body with user and ids of channels data
 */
function doUser(clientId, body) {
    let user = { name: body.username, channels: [] };
    if (users[body.username]) {
        user = users[user.name];
    }
    else {
        users[user.name] = user;
    }
    return [[clientId], {type: 'user', data: user }];
}

module.exports = {
    doUser,
};