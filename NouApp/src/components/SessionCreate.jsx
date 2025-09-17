import React from 'react';
import './css/SessionCreate.css';
import { SERVER_URL } from '../config';
import { useStore } from '../hooks/useStore';
import { useWebSocket } from '../hooks/useWebSocket';

export function SessionCreate() {
    const ws = useWebSocket();
    const store = useStore();
    function onSubmit(e) {
        e.preventDefault();
        const username = document.querySelector('input').value;
        ws.current.onmessage = (messageEvent) => {
            const messageData = JSON.parse(messageEvent.data);
            if (messageData.type !== 'user') {
                return;
            }
            if (!messageData.error && messageData.data) {
                console.log(messageData.data);
                store.initUser(messageData.data.name, messageData.data.channels);
                sessionStorage.setItem('user', JSON.stringify(messageData.data));
                window.location = '/channels';
            }
        };
        ws.current.send(JSON.stringify({type: 'user', username}));
    }
    return (
        <div>
            <form className='login-form' action="" onSubmit={onSubmit}>
                <input type="text" className='login-form__user-name-input' placeholder="/* Enter name */"/>
                <button className='login-form__submit-button'>/Chat</button>
            </form>
        </div>
    );
}
