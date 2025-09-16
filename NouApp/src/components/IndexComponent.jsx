import React from 'react';
import { Message } from './Message';
import { Chat } from './Chat';
import './css/IndexComponent.css';

export function IndexComponent() {
    // ref on message
    const message = React.useRef('');
    const ws = React.useRef(null);
    React.useEffect(() => {
        ws.current = new WebSocket('ws://localhost:80');
        ws.current.onmessage = (message) => {
            console.log(message.data);
        }
    }, []);
    /**
     * message input field handler
     * @param e - Event
     */
    function handleInput(e) {
        message.current = e.target.value;
        console.log(message.current);
    }
    /**
     * send message function
     * @param e - Event 
     */
    function sendMessage(e) {
        e.preventDefault();
        const message = document.querySelector('.channel-form-message__input-message');
        ws.current.send(JSON.stringify({message: message.value}));
        console.log(`message sended: ${message.value}`);
    }
    return (
        <div className="channel">
            <Chat/>
            <form action="" className="channel-form-message" onSubmit={sendMessage}>
                <input type="text" className="channel-form-message__input-message" onChange={handleInput} placeholder="/* type some message... */"/>
                <button className="channel-form-message__send-button" type="submit">-&gt;</button>
            </form>
        </div>
    );
}