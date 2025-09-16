import React from 'react';
import './css/Message.css';

export function Message({isSelf = false, ...props}) {
    return (
        <div className={`row-message ${isSelf ? 'row-self-message' : ''}`}>
            <div className="message">
                <div className="message-content">
                    {props.children}
                </div>
            </div>
        </div>
    );
}