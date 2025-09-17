import { types } from 'mobx-state-tree';
import { MUser } from './User';

/**
 * root store model
 * @param user - maybe null user (null when user session not created)
 */
export const MRootStore = types.model('RootStore', {
    user: types.maybeNull(MUser),
}).actions(self => ({
    initUser(name, channels) {
        self.user = MUser.create({name, channels});
    }
}));
