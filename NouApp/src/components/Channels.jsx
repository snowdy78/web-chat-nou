import React from "react";
import "./css/Channels.css";
import { useWebSocket, useStore } from "../hooks";
import { observer } from "mobx-react-lite";

export const Channels = observer(function () {
  const store = useStore();
  const [warning, setWarning] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [channels, setChannels] = React.useState([]);

  const ws = useWebSocket({
    init: () => {
      // getting all user channels
      ws.current.send(
        JSON.stringify({ type: "userchannels", username: store.user.name })
      );
    },
    onChannel,
    onRemoveMember,
    onMessage,
    onUserChannels,
    onError: setError,
    onWarning: setWarning,
  });
  function onRemoveMember(body) {
    setChannels((prevChannels) => {
      // check if kick not me do nothing
      if (store.user.name !== body.membername) {
        return prevChannels;
      }
      const channelIndex = prevChannels.find(
        (channelData) => channelData.name === body.channelName
      );
      // removing channel from channels
      prevChannels.splice(channelIndex, 1);
      return [...prevChannels];
    });
  }
  function onChannel(data) {
    setChannels((prevChannels) => {
      const channel = data.data;
      // check if channel not already exist
      if (prevChannels.find((c) => channel.name === c.name)) {
        return prevChannels;
      }
      // add a new channel to state
      return [
        ...prevChannels,
        {
          name: channel.name,
          lastMessage: channel.messages[channel.messages.length - 1],
        },
      ];
    });
  }
  function onUserChannels(data) {
    setChannels(() => [...data.data.channels]);
  }
  function onMessage(data) {
    setChannels((prevChannels) => {
      const channelIndex = prevChannels.findIndex(
        (channel) => channel.name === data.channelName
      );
      // check channel name is correct
      if (channelIndex === -1) {
        console.warn("channel not found", data.channelName, channels);
        return prevChannels;
      }
      prevChannels[channelIndex].lastMessage = data.data;
      return [...prevChannels];
    });
  }
  function onChannelAdd(event) {
    event.preventDefault();
    const channel = document.querySelector(
      ".channels-component__input-channel-name"
    );
    if (channel) {
      ws.current.send(
        JSON.stringify({
          type: "channel",
          username: store.user.name,
          channelName: channel.value,
        })
      );
      channel.value = "";
    }
  }
  return (
    <div className="channels-component">
      <div className="channels-component__header">
        {
          <form
            onSubmit={onChannelAdd}
            style={{ display: "flex", width: "100%", gap: 5 }}
          >
            <input
              type="text"
              className="channels-component__input-channel-name"
              placeholder="Enter channel name to connect or create"
            />
            <button type="submit">&gt;</button>
          </form>
        }
      </div>
      <div className="left-account-button-container">
        <button
          className="left-account-button bi-box-arrow-left"
          onClick={() => (window.location = "/")}
        />
      </div>
      <div className="channel-list">
        {error ? <div className="error-field">{warning}</div> : null}
        {warning ? <div className="warn-field">{warning}</div> : null}
        {channels.length === 0 ? (
          <div className="hidden-text">You have no channels yet</div>
        ) : (
          channels.map((value, index) => (
            <div
              key={`channel-list__channel${index}`}
              className="channel-list__channel"
              onClick={() => (window.location = `/channel/${value.name}`)}
            >
              <div className="channel-list__channel__name">{value.name}</div>
              <div className="channel-list__channel__last-message">
                {value.lastMessage
                  ? `${value.lastMessage.authorName}: ${value.lastMessage.text}`
                  : "No messages sended"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
