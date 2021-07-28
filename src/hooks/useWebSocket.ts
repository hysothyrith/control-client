import { useState, useRef } from "react";

type SocketStatus = "idle" | "opening" | "open" | "closing" | "closed";

interface UseWebSocketOptions {
  onOpen?: () => void;
  onError?: (err: any) => void;
  onClose?: () => void;
}

function useWebSocket({ onOpen, onClose, onError }: UseWebSocketOptions) {
  const socket = useRef<WebSocket | undefined>();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [error, setError] = useState<Event | null>();

  const isIdle = status === "idle";
  const isOpening = status === "opening";
  const isOpen = status === "open";
  const isClosing = status === "closing";
  const isClosed = status === "closed";

  function connect(url: string) {
    setStatus("opening");
    setError(null);

    try {
      socket.current = new WebSocket(url);
      socket.current.onopen = () => {
        setStatus("open");
        setUrl(url);
        onOpen && onOpen();
      };

      socket.current.onerror = (err) => {
        setError(err);
        onError && onError(err);
      };

      socket.current.onclose = () => {
        setStatus("closed");
        onClose && onClose();
      };
    } catch (err) {
      setError(err);
      onError && onError(err);
    }
  }

  function send(message: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (!socket.current || !isOpen) {
      throw new Error("WebSocket is not open");
    }
    socket.current.send(message);
  }

  function disconnect() {
    if (!socket.current || !isOpen) {
      throw new Error("WebSocket is not open");
    }

    setStatus("closing");
    socket.current.close();
    setUrl("");
  }

  return {
    url,
    connect,
    send,
    disconnect,
    isIdle,
    isOpening,
    isOpen,
    isClosing,
    isClosed,
    error,
  };
}

export default useWebSocket;
