import { types } from 'mobx-state-tree'

/**
 * Store of channels model
 * @param channels - array of existed channels
 */
export const MChannelStore = types.model('ChannelStore', {
    channels: types.array(types.string),
});
