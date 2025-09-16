import { types } from 'mobx-state-tree'
import { MMessage } from './Message'
/**
 * channel model
 * @param id - id of the channel
 * @param name - name of the channel
 * @param messages - array of messages
 */
export const MChannel = types.model('Channel', {
    id: types.string,
    name: types.string,
    messages: types.array(MMessage)
});
