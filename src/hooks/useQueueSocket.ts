import { useEffect, useState } from "react";
import { getSocket, type QueueState } from "@/lib/socket";
import { toast } from "sonner";

export function useQueueSocket(role: "reception" | "patient") {
  const [state, setState] = useState<QueueState | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const join = () => socket.emit(`${role}:join`, {});
    const onConnect = () => {
      setConnected(true);
      join();
    };
    const onDisconnect = () => setConnected(false);
    const onState = (snap: QueueState) => setState(snap);
    const onNotice = (n: { type: string; message: string }) => {
      toast(n.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("queue:state", onState);
    socket.on("queue:notice", onNotice);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("queue:state", onState);
      socket.off("queue:notice", onNotice);
    };
  }, [role]);

  return { state, connected, socket: getSocket() };
}