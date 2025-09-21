import { types } from 'mobx-state-tree';

/**
 * user model
 * @param name - unique name of the user
 * @param channels - user own channels
 */
export const MUser = types.model('User', {
    name: types.string,
});
