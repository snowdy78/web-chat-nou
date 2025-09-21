import React from 'react';
import './css/Channels.css';
import { useWebSocket, useStore } from '../hooks';
import {Link} from 'react-router-dom';
import { observer } from "mobx-react-lite";

export const Channels = observer(function() {
    const store = useStore();
    const [channelLoadWarning, setChannelLoadWarning] = React.useState(null);
    const [channelError, setChannelError] = React.useState(null);
    const [channels, setChannels] = React.useState([]);
    const webSocketActions = React.useRef({
        'userchannels': onUserChannels,
        'channel': onChannel,
        'message': onMessage,
    });

    const ws = useWebSocket(() => {
        ws.current.onopen = () => {
            ws.current.onmessage = (messageEvent) => {
                const response = JSON.parse(messageEvent.data);
                if (response && response.type && webSocketActions.current[response.type]) {
                    webSocketActions.current[response.type](response);
                }
            };
            if (store.user.channels.length > 0) {
                ws.current.send(JSON.stringify({ type: 'userchannels', username: store.user.name}));
            }
        };
    });
    React.useMemo(() => {
        if (!store.user) {
            window.location = '/';
        }
    }, [store]);
    function onChannel(data) {
        setChannels((prevChannels) => {
            const channel = data.data;
            if (prevChannels.find(c => channel.name === c.name)) {
                return prevChannels;
            }
            store.appendUserChannel(channel.name);
            const userData = { name: store.user.name, channels: [...channels.map(v => v.name), channel.name] };
            sessionStorage.setItem('user', JSON.stringify(userData));
            return [...prevChannels, {name: channel.name, lastMessage: channel.messages[channel.messages.length - 1]}]
        });
        
    }
    function onUserChannels(data) {
        if (data.error) {
            setChannelError(data.error.message);
        }
        if (data.warn) {
            setChannelLoadWarning('Not all channels are load.');
        }
        else {
            setChannels(() => [...data.data.channels]);
        }
    }
    function onMessage(data) {
        setChannels((prevChannels) => {
            const channelIndex = prevChannels.findIndex(channel => channel.name === data.channelName);
            if (channelIndex === -1) {
                console.warn('channel not found', data.channelName, channels);
                return prevChannels;
            }
            prevChannels[channelIndex].lastMessage = data.data;
            return [...prevChannels];
        });
    }
    function onChannelAdd(event) {
        event.preventDefault();
        const channel = document.querySelector('.channels-component__input-channel-name');
        if (channel) {
            ws.current.send(JSON.stringify({type: 'channel', username: store.user.name, channelName: channel.value }));
            channel.value = '';
        }
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
                {
                    channelError ? <div className='error-field'>{channelLoadWarning}</div> : null
                }
                {
                    channelLoadWarning ? <div className='warn-field'>{channelLoadWarning}</div> : null
                }
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
                            {value.lastMessage ? `${value.lastMessage.authorName}: ${value.lastMessage.text}` : 'No messages sended'} 
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
