import React from 'react';
import { useStore } from '../hooks/useStore';
import './css/Channels.css';
import { useWebSocket } from '../hooks/useWebSocket';

export function Channels() {
    const store = useStore();
    const user = React.useRef(null);
    const [channelLoadWarning, setChannelLoadWarning] = React.useState('asdfas');
    const ws = useWebSocket(() => {
        ws.current.onopen = () => {
            if (store.user.channels > 0) {
                ws.current.onmessage = (messageEvent) => {
                    const messageData = JSON.parse(messageEvent.data);
                    if (messageData.type !== 'userchannels') {
                        return;
                    }
                    if (messageData.username !== store.user.name) {
                        return;
                    }
                    if (messageData.warn) {
                        setChannelLoadWarning('Not all channels are load.');
                        return;
                    }

                };
                ws.current.send(JSON.stringify({ type: 'userchannels', username: user.current.name }));
            }
        };
    });
    React.useMemo(() => {
        if (!store.user) {
            window.location = '/';
        }
        user.current = store.user;
    }, [user, store]);

    let warnComponent;
    if (channelLoadWarning) {
        warnComponent = <div className='warn-field'>{channelLoadWarning}</div>;
    }
    return (
        <div className="channel-list">
            {warnComponent}
            {user.current.channels.length === 0 
            ? 
            <div>
                Channels does not exist
            </div> 
            : 
            user.current.channels.map((value, index) => (
                <div key={`channel-list__channel${index}`} className="channel-list__channel">
                    <div className="channel-list__channel_Name">

                    </div>
                </div>
            ))}
        </div>
    );
}
