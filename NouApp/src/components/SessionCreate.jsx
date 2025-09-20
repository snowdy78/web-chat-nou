import React from 'react';
import './css/SessionCreate.css';
import { SERVER_URL } from '../config';
import { useStore, useWebSocket } from '../hooks';

export function SessionCreate() {
    const ws = useWebSocket(() => {
        ws.current.onmessage = (messageEvent) => {
            const messageData = JSON.parse(messageEvent.data);
            if (messageData.type !== 'user') {
                return;
            }
            if (messageData.error) {
                setLoginError(messageData.error.message);
            }
            else if (messageData.data) {
                store.initUser(messageData.data.name, messageData.data.channels);
                sessionStorage.setItem('user', JSON.stringify(messageData.data));
                window.location = '/channels';
                return;
            }
            else {
                console.error('No response message data.');
            }
        };
    });
    const store = useStore();
    const [loginError, setLoginError] = React.useState(null);
    function onSubmit(e) {
        e.preventDefault();
        const username = document.querySelector('input').value;
        
        ws.current.send(JSON.stringify({type: 'user', username}));
    }
    return (
        <div>
            { loginError ?
            <div className='error-field'>{loginError}</div> : null
            }
            <form className='login-form' action="" onSubmit={onSubmit}>
                <input type="text" className='login-form__user-name-input' placeholder="/* Enter name */"/>
                <button className='login-form__submit-button'>/Chat</button>
            </form>
        </div>
    );
}
