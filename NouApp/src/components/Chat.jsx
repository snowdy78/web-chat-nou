import { Message } from './Message';
import './css/Chat.css';

export function Chat({messages = [], handleMessageText = messageText => messageText}) {
    return ( // TODO author check
        <div className='chat-container'>
            <div className='chat'>
                {messages.map((value, index) => 
                    <Message key={`chat_message${index}`} own={value.own}>
                        {handleMessageText(value.message, index)}
                    </Message>
                )}

            </div>
        </div>
    );
}
