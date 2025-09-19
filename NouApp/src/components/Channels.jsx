import React from 'react';
import { useStore } from '../hooks/useStore';
import './css/Channels.css';
import { useWebSocket } from '../hooks/useWebSocket';
import {Link} from 'react-router-dom';

export function Channels() {
    const store = useStore();
    const [channelLoadWarning, setChannelLoadWarning] = React.useState(null);
    const [channels, setChannels] = React.useState([]);
    const webSocketActions = {
        'userchannels': onUserChannels,
        'channel': onChannel,
        'message': onMessage,
    };

    const ws = useWebSocket(() => {
        ws.current.onopen = () => {
            ws.current.onmessage = (messageEvent) => {
                const messageData = JSON.parse(messageEvent.data);
                if (messageData && messageData.type && webSocketActions[messageData.type]) {
                    console.log(messageData.type);
                    webSocketActions[messageData.type](messageData);
                }
            };
            if (store.user.channels > 0) {
                ws.current.send(JSON.stringify({ type: 'userchannels', username: store.user.name }));
            }
        };
    });
    React.useMemo(() => {
        if (!store.user) {
            window.location = '/';
        }
    }, [store.user]);

    function onChannel(data) {
        if (data.username !== store.user.name) {
            return;
        }
        const channel = data.data;
        store.user.addChannel(channel.name);
        setChannels([...channels, {name: channel.name, lastMessage: channel.messages[channel.messages.length - 1]}]);
    }
    function onUserChannels(data) {
        if (data.username !== store.user.name) {
            return;
        }
        if (data.warn) {
            setChannelLoadWarning('Not all channels are load.');
            return;
        }
        store.user.addChannel(data.channelName);
        setChannels([...channels, ...data.data.channels]);
    }
    function onMessage(data) {
        if (data.username !== store.user.name) {
            return;
        }
        const channelIndex = channels.findIndex(data.channelName);
        if (channelIndex === -1) {
            return;
        }
        channels[channelIndex].lastMessage = data.data;
        setChannels([...channels]);
    }
    function onChannelAdd(event) {
        event.preventDefault();
        const channel = document.querySelector('.channels-component__input-channel-name');
        if (channel) {
            ws.current.send(JSON.stringify({type: 'channel', username: store.user.name, channelName: channel.value }));
            channel.value = '';
        }
    }
    let warnComponent;
    if (channelLoadWarning) {
        warnComponent = <div className='warn-field'>{channelLoadWarning}</div>;
    }
    return (
        <div className='channels-component'>
            <div className='channels-component__header'>
                {
                <form onSubmit={onChannelAdd} style={{display: 'flex', width: '100%', gap: 5}}>
                    <input type="text" className='channels-component__input-channel-name' placeholder='Enter channel name to connect or create'/>
                    <button type="submit">&gt;</button>
                </form>
                }
                
            </div>
            <div className="channel-list">
                {warnComponent}
                {channels.length === 0
                ? 
                <div className='hidden-text'>
                    Channels does not exist
                </div> 
                : 
                channels.map((value, index) => (
                    <div key={`channel-list__channel${index}`} className="channel-list__channel">
                        <div className="channel-list__channel__name">
                            <Link to={`/channel/${value.name}`}>{value.name}</Link>
                        </div>                        
                        <div className="channel-list__channel__last-message">
                            {value.lastMessage ? `${value.lastMessage.authorName}:${value.lastMessage.text}` : 'No messages sended'} 
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
