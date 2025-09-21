import "./css/Message.css";

export function Message({ own = false, ...props }) {
  return (
    <div className={`row-message ${own ? "row-self-message" : ""}`}>
      <div className="message">
        <p className="message-content">{props.children}</p>
      </div>
    </div>
  );
}
