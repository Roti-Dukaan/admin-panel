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
/** Auth token applied on the last successful socket connection. */
let connectedAuthToken: string | null = null;

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
      connectedAuthToken = getToken();
      console.log("[Socket] Connected:", socket?.id);
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io client disconnect") {
        connectedAuthToken = null;
      }
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
  const token = getToken();
  if (token && !s.connected) s.connect();
  return s;
}

/**
 * Reconnect only when the auth token changed (login / refresh). Avoids tearing
 * down an active socket on every hook mount — that caused persistent "Offline"
 * on branch kitchen pages with multiple realtime consumers.
 */
export function reconnectRealtimeWithAuth(): void {
  ensureRealtimeAuth(getToken());
}

/** Apply the latest auth token to the shared socket without redundant reconnects. */
export function ensureRealtimeAuth(token: string | null): void {
  if (!token) return;
  const s = ensureSocket();
  if (s.connected && connectedAuthToken === token) return;

  connectedAuthToken = token;
  if (s.connected) {
    s.disconnect();
  }
  if (refCount > 0) {
    s.connect();
  }
}

/** Drop socket auth after logout. */
export function resetRealtimeAuth(): void {
  connectedAuthToken = null;
  if (socket?.connected) {
    socket.disconnect();
  }
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
