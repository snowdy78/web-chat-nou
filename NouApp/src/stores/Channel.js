import { types } from 'mobx-state-tree';
import { MMessage } from './Message';

/**
 * channel model
 * @param name - unique name of the channel
 * @param messages - array of messages
 */
export const MChannel = types.model('Channel', {
    authorName: types.string,
    name: types.string,
    messages: types.optional(types.array(MMessage), []),
});
