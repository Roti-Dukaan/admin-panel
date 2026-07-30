import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/env";

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
/** Latest token to send on the next handshake (store may lead localStorage briefly). */
let pendingAuthToken: string | null = null;
/** True while an intentional disconnect is in flight (auth refresh or refCount teardown). */
let refreshingAuth = false;

function resolveAuthToken(explicit?: string | null): string | null {
  return explicit ?? pendingAuthToken ?? getToken();
}

function ensureSocket(): Socket {
  if (!socket) {
    if (!API_BASE_URL) {
      console.error("[Socket] NEXT_PUBLIC_API_URL is not configured — realtime disabled.");
    }

    socket = io(API_BASE_URL || undefined, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: () => {
        const token = resolveAuthToken();
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
      refreshingAuth = false;
      connectedAuthToken = resolveAuthToken();
      console.log("[Socket] Connected:", socket?.id);
    });
    socket.on("disconnect", (reason) => {
      // Do not wipe auth state when we deliberately disconnect to re-handshake.
      if (reason === "io client disconnect" && !refreshingAuth) {
        connectedAuthToken = null;
      }
      console.log("[Socket] Disconnected:", reason);
    });
  }
  return socket;
}

function connectIfNeeded(token?: string | null): void {
  const authToken = resolveAuthToken(token);
  if (!authToken || !API_BASE_URL) return;

  pendingAuthToken = authToken;
  const s = ensureSocket();

  if (s.connected && connectedAuthToken === authToken) return;

  if (s.connected && connectedAuthToken !== authToken) {
    refreshingAuth = true;
    connectedAuthToken = authToken;
    s.disconnect();
    // refreshingAuth stays true until the connect handler runs.
  }

  if (!s.connected) {
    s.connect();
  }
}

/**
 * Reference-counted connection so multiple hooks (kitchen dashboard, orders
 * screen) can share a single socket without tearing it down under each other.
 * Pass the store accessToken when available so the handshake does not rely on
 * localStorage being ahead of zustand during login/hydration.
 */
export function connectRealtime(token?: string | null): Socket {
  const s = ensureSocket();
  refCount += 1;
  connectIfNeeded(token);
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
  pendingAuthToken = token;

  if (refCount <= 0) return;

  connectIfNeeded(token);
}

/** Drop socket auth after logout. */
export function resetRealtimeAuth(): void {
  pendingAuthToken = null;
  connectedAuthToken = null;
  if (socket?.connected) {
    refreshingAuth = true;
    socket.disconnect();
    refreshingAuth = false;
  }
}

export function disconnectRealtime(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket?.connected) {
    refreshingAuth = true;
    connectedAuthToken = null;
    pendingAuthToken = null;
    socket.disconnect();
    refreshingAuth = false;
  }
}

export function getRealtimeSocket(): Socket {
  return ensureSocket();
}

export function isRealtimeConnected(): boolean {
  return !!socket?.connected;
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
