import { useState, useRef } from "react";

type SocketStatus = "idle" | "opening" | "open" | "closing" | "rejected";

interface UseWebSocketOptions {
  onOpen?: () => void;
  onError?: (err: any) => void;
  onClose?: () => void;
}

function useWebSocket({ onOpen, onClose, onError }: UseWebSocketOptions) {
  const socket = useRef<WebSocket | undefined>();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<SocketStatus>("idle");

  const isIdle = status === "idle";
  const isOpening = status === "opening";
  const isOpen = status === "open";
  const isClosing = status === "closing";
  const isRejected = status === "rejected";

  function connect(url: string) {
    setStatus("opening");
    try {
      socket.current = new WebSocket(url);
      socket.current.onopen = () => {
        setStatus("open");
        setUrl(url);
        onOpen && onOpen();
      };
      socket.current.onerror = (err) => {
        setStatus("rejected");
        onError && onError(err);
      };
    } catch (err) {
      setStatus("rejected");
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
    setUrl("");
    socket.current.close();

    socket.current.onclose = () => {
      setStatus("idle");
      onClose && onClose();
    };
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
    isRejected,
  };
}

export default useWebSocket;
