import { types } from 'mobx-state-tree'

/**
 * message model
 * @param id - message id
 * @param channelName - message channel name
 * @param authorName - message author name
 * @param text - message text
 */
export const MMessage = types.model('Message', {
    id: types.string,
    channelName: types.string,
    authorName: types.string,
    text: types.string,
});
