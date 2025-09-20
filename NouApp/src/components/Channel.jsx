import React from "react";
import { Message } from "./Message";
import { Chat } from "./Chat";
import "./css/Channel.css";
import { useParams } from "react-router-dom";
import { useWebSocket, useStore } from "../hooks";

export function Channel() {
  // ref on message
  const message = React.useRef("");
  const params = useParams();
  const [chatMessages, setChatMessages] = React.useState([]);
  const store = useStore();
  const ws = useWebSocket(() => {
    ws.current.onmessage = (messageEvent) => {
      setChatMessages([...chatMessages, ...JSON.parse(messageEvent.data)]);
    };
  }, [chatMessages]);
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
    const message = document.querySelector(
      ".channel-form-message__input-message"
    );
    ws.current.send(
      JSON.stringify({
        type: "message",
        username: store.user.name,
        message: message.value,
      })
    );
    console.log(`message sended: ${message.value}`);
    message.value = "";
  }
  return (
    <div className="channel">
      <div className="channel__header">
        <div className="channel__header__close-channel">&lt;</div>
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
}
