import React from "react";
import "./css/SessionCreate.css";
import { useStore, useWebSocket } from "../hooks";
import { observer } from "mobx-react-lite";

/**
 * component that creates session
 */
export const SessionCreate = observer(function () {
  const store = useStore();
  const [loginError, setLoginError] = React.useState(null);
  const ws = useWebSocket({
    init: () => {
      // getting all user channels
      ws.current.send(
        JSON.stringify({ type: "userchannels", username: store.user.name })
      );
    },
    onUser: (messageData) => {
      store.initUser(messageData.data.name, messageData.data.channels);
      // save user to session
      sessionStorage.setItem(
        "user",
        JSON.stringify({ name: messageData.data.name })
      );
      window.location = "/channels";
      return;
    },
    onError: setLoginError,
  });
  function onSubmit(e) {
    e.preventDefault();
    const username = document.querySelector("input").value;
    // send username on server to get user data
    ws.current.send(JSON.stringify({ type: "user", username }));
  }
  return (
    <div>
      {loginError ? <div className="error-field">{loginError}</div> : null}
      <form className="login-form" action="" onSubmit={onSubmit}>
        <input
          type="text"
          className="login-form__user-name-input"
          placeholder="/* Enter name */"
        />
        <button className="login-form__submit-button">/Chat</button>
      </form>
    </div>
  );
});
