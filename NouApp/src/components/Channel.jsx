import React from "react";
import { Chat } from "./Chat";
import "./css/Channel.css";
import { useParams } from "react-router-dom";
import { useWebSocket, useStore } from "../hooks";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import 'bootstrap-icons/font/bootstrap-icons.css';

export const Channel = observer(function() {
  // ref on message
  const params = useParams();
  const store = useStore();
  const responseActions = {
    'message': onMessage,
    'channel': onChannel,
  };
  const ws = useWebSocket(() => {
    ws.current.onopen = () => {
      ws.current.onmessage = (messageEvent) => {
        const responseBody = JSON.parse(messageEvent.data);
        if (responseBody.error) {
          console.error(responseBody.error.message);
          return;
        }
        if (!responseBody.type || !responseActions[responseBody.type]) {
          return;
        }
        responseActions[responseBody.type](responseBody);
      };
      if (messages.length === 0) {
        // getting channel messages
        ws.current.send(JSON.stringify({type: 'channel', username: store.user.name, channelName: params.name}));
      }
    };
  });
  
  const [messages, setMessages] = React.useState([]);
  React.useEffect(() => {
    const chat = document.querySelector('.chat-container');
    chat.scrollTo(0, chat.scrollHeight);
  }, [messages]);
  function transformMessageFromServer(message) {
    return {own: store.user.name === message.authorName, message: message.text}
  }
  function onMessage(responseBody) {
    const message = responseBody.data;
    const transformedMessage = transformMessageFromServer(message);
    setMessages((prevMessages) => [...prevMessages, transformedMessage]);
  }
  function onChannel(responseBody) {
    setMessages(() => responseBody.data.messages.map(message => (transformMessageFromServer(message))))
  }
  /**
   * send message function
   * @param e - Event
   */
  function sendMessage(e) {
    e.preventDefault();
    const message = document.querySelector(
      ".channel-form-message__input-message"
    );
    ws.current.send(
      JSON.stringify({
        type: "message",
        username: store.user.name,
        channelName: params.name,
        data: { text: message.value },
      })
    );
    message.value = "";
  }
  return (
    <div className="channel">
      <div className="channel__header">
        <Link to="/channels" className="channel__header__close-channel">
          &lt;
        </Link>
        <div className="channel__header__channel-name">{params.name}</div>
        <Link to={`/channel-info/${params.name}`} className='bi bi-people-fill'></Link>
      </div>
      <Chat
        messages={messages}
      />
      <form className="channel-form-message" onSubmit={sendMessage}>
        <input
          type="text"
          className="channel-form-message__input-message"
          placeholder="/* type some message... */"
        />
        <button className="channel-form-message__send-button" type='submit'>
          -&gt;
        </button>
      </form>
    </div>
  );
});
