import { io, type Socket } from "socket.io-client";

const URL = (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, { transports: ["websocket", "polling"], autoConnect: true });
  }
  return socket;
}

export type QueueState = {
  current: { tokenNumber: number; name: string | null; calledAt: string } | null;
  waiting: Array<{
    tokenNumber: number;
    name: string | null;
    tokensAhead: number;
    estimatedWaitMinutes: number;
  }>;
  avgConsultMinutes: number;
  effectiveAvgMinutes: number;
  stats: { waitingCount: number; completedCount: number };
};