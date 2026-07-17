import { io, type Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

let socket: Socket | null = null;
let refCount = 0;

function ensureSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: () => {
        const token = getToken();
        return { token };
      },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });
    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });
  }
  return socket;
}

/**
 * Reference-counted connection so multiple hooks (kitchen dashboard, orders
 * screen) can share a single socket without tearing it down under each other.
 * Returns a disconnect function to be called on unmount.
 */
export function connectRealtime(): Socket {
  const s = ensureSocket();
  refCount += 1;
  if (!s.connected) s.connect();
  return s;
}

export function disconnectRealtime(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket?.connected) {
    socket.disconnect();
  }
}

export function getRealtimeSocket(): Socket {
  return ensureSocket();
}

export type RealtimeEventHandler = (payload: unknown) => void;

/** Subscribe to an event for the lifetime of the calling component. */
export function onRealtime(event: string, handler: RealtimeEventHandler): () => void {
  const s = ensureSocket();
  s.on(event, handler);
  return () => {
    s.off(event, handler);
  };
}
