import { types } from 'mobx-state-tree';

/**
 * user model
 * @param name - unique name of the user
 * @param channels - user own channels
 */
export const MUser = types.model('User', {
    name: types.string,
    channels: types.array(types.string),
}).actions(self => ({
    /**
     * adds channel to user
     * @param {string} name - unique name of the channel
     */
    addChannel(name) {
        self.channels.push(name);
    },
}));
