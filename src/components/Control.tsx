import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import styles from "../styles/Control.module.css";

export default function Control() {
  const [url, setUrl] = useState("");
  const socket = useWebSocket({ onError: (err) => console.error(err) });

  function toggleConnection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (socket.isOpen) {
      socket.disconnect();
    } else {
      socket.connect(url);
    }
  }

  useEffect(() => {
    if (socket.isOpen) {
      document.addEventListener("keydown", onKeyDown, false);
      return () => {
        document.removeEventListener("keydown", onKeyDown, false);
      };
    }
  }, [socket.isOpen]);

  function onKeyDown(e: KeyboardEvent) {
    if (!socket.isOpen) return;

    switch (e.key) {
      case "ArrowLeft":
        socket.send("prev");
        break;
      case "ArrowRight":
        socket.send("next");
        break;
      default:
        break;
    }
  }

  return (
    <form onSubmit={toggleConnection}>
      <label htmlFor="serverUrl">Control Server URL: </label>
      <input
        type="text"
        id="serverUrl"
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
        onKeyDown={(e) => e.stopPropagation()}
        disabled={socket.isOpen}
        className={styles.input}
      />
      <button disabled={url === ""} className={styles.toggle}>
        {socket.isOpen ? "Disconnect" : "Connect"}
      </button>
      {socket.isOpening && <div>Connecting...</div>}
      {socket.isClosing && <div>Disconnecting...</div>}
      {socket.error ? (
        <div>An error occurred...</div>
      ) : (
        socket.isClosed && <div>Disconnected from Control Server...</div>
      )}
      {socket.isOpen && (
        <div className={styles.actionWrapper}>
          <button onClick={() => socket.send("prev")} className={styles.action}>
            Previous
          </button>
          <button onClick={() => socket.send("next")} className={styles.action}>
            Next
          </button>
        </div>
      )}
    </form>
  );
}
