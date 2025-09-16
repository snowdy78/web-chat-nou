import React from 'react';
import './css/Message.css';

export function Message({own = false, ...props}) {
    return (
        <div className={`row-message ${own ? 'row-self-message' : ''}`}>
            <div className="message">
                <div className="message-content">
                    {props.children}
                </div>
            </div>
        </div>
    );
}