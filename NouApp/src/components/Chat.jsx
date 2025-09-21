import { Message } from "./Message";
import "./css/Chat.css";

/**
 * display chat messages from list messages
 * @param {Array} messages - array of messages to display
 * @param {(messageText) => string } handleMessageText - transforms message text (does not transform message by default)
 * @returns
 */
export function Chat({
  messages = [],
  handleMessageText = (messageText) => messageText,
}) {
  return (
    <div className="chat-container">
      <div className="chat">
        {messages.map((value, index) => (
          <Message key={`chat_message${index}`} own={value.own}>
            {handleMessageText(value.message, index)}
          </Message>
        ))}
      </div>
    </div>
  );
}
