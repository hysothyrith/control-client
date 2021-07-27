import React, { useEffect, useRef, useState } from "react";
import useConnectionStatus from "../hooks/useConnectionStatus";

export default function Control() {
  const status = useConnectionStatus();
  const webSocket = useRef<WebSocket | undefined>();
  const [url, setUrl] = useState("");

  function toggleConnection() {
    status.load();
    if (!status.isConnected()) {
      setupWebSocket();
    } else {
      disconnectWebSocket();
    }
  }

  function setupWebSocket() {
    webSocket.current = new WebSocket(url);
    webSocket.current.onopen = () => {
      status.resolve();
    };
    webSocket.current.onerror = (err) => {
      status.reject();
    };
  }

  function disconnectWebSocket() {
    webSocket.current.close();
    webSocket.current.onclose = () => {
      status.reset();
    };
  }

  function sendAction(action: string) {
    if (!status.isConnected()) return;

    webSocket.current.send(action);
  }

  useEffect(() => {
    if (status.isConnected()) {
      document.addEventListener("keydown", onKeyDown, false);
      return () => {
        document.removeEventListener("keydown", onKeyDown, false);
      };
    }
  }, [status.isConnected()]);

  function onKeyDown(e: KeyboardEvent) {
    if (!status.isConnected()) return;

    switch (e.key) {
      case "ArrowLeft":
        sendAction("prev");
        break;
      case "ArrowRight":
        sendAction("next");
        break;
      default:
        break;
    }
  }

  return (
    <div>
      <label htmlFor="serverUrl">Control Server URL: </label>
      <input
        type="text"
        id="serverUrl"
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
        onKeyDown={(e) => e.stopPropagation()}
      ></input>
      <button onClick={toggleConnection} disabled={url === ""}>
        {status.isConnected() ? "Disconnect" : "Connect"}
      </button>
      {status.isConnecting() && <div>Connecting...</div>}
      {status.isRejected() && <div>There was an error...</div>}
      {status.isConnected() && (
        <div>
          <button onClick={() => sendAction("prev")}>Previous</button>
          <button onClick={() => sendAction("next")}>Next</button>
        </div>
      )}
    </div>
  );
}
