import { useState } from "react";

type ConnnectionStatus = "idle" | "connecting" | "connected" | "rejected";

export default function useConnectionStatus() {
  const [status, setStatus] = useState<ConnnectionStatus>("idle");

  const isIdle = () => status === "idle";
  const isConnecting = () => status === "connecting";
  const isConnected = () => status === "connected";
  const isRejected = () => status === "rejected";

  const load = () => setStatus("connecting");
  const resolve = () => setStatus("connected");
  const reject = () => setStatus("rejected");
  const reset = () => setStatus("idle");

  return {
    isIdle,
    isConnecting,
    isConnected,
    isRejected,
    load,
    resolve,
    reject,
    reset,
  };
}
