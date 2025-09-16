import { types } from 'mobx-state-tree'

export const MMessage = types.model('Message', {
    id: types.string,
    text: types.string,
    author: types.string // TODO: user model
});
