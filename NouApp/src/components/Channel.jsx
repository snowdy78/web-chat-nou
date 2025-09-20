import React from "react";
import { Message } from "./Message";
import { Chat } from "./Chat";
import "./css/Channel.css";
import { useParams } from "react-router-dom";
import { useWebSocket, useStore } from "../hooks";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";

export const Channel = observer(function() {
  // ref on message
  const message = React.useRef("");
  const params = useParams();
  const [chatMessages, setChatMessages] = React.useState([]);
  const store = useStore();
  const messages = React.useState([]);
  const ws = useWebSocket(() => {
    ws.current.onopen = () => {
      ws.current.onmessage = (messageEvent) => {
        const responseBody = JSON.parse(messageEvent.data);
        if (!responseBody.type || responseBody.type !== 'message') {
          return;
        }
        if (responseBody.error) {
          console.error(responseBody.error.message);
        }
        setChatMessages([...chatMessages]);
      };
      if (messages.length === 0) {
        // getting channel messages
        ws.current.send(JSON.stringify({}))
      }
    };
  }, [chatMessages]);
  /**
   * message input field handler
   * @param e - Event
   */
  function handleInput(e) {
    message.current = e.target.value;
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
      </div>
      <Chat
        messages={chatMessages}
        handleMessageText={(message, index) => message + `${index}`}
      />
      <form action="" className="channel-form-message" onSubmit={sendMessage}>
        <input
          type="text"
          className="channel-form-message__input-message"
          onChange={handleInput}
          placeholder="/* type some message... */"
        />
        <button className="channel-form-message__send-button" type="submit">
          -&gt;
        </button>
      </form>
    </div>
  );
});
