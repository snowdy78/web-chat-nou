import { Message } from './Message';
import React from 'react';

import './css/Chat.css';

export function Chat({messages = [], ...props}) {
    return ( // TODO author check
        <div className='chat'>
            {messages.map((value, index) => 
                <Message key={`chat_message${index}`}>
                    {value.message}
                </Message>
            )} 
        </div>
    );
}