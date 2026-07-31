"use client";

import { useEffect, useState } from "react";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import { getRealtimeSocket, isRealtimeConnected, onRealtime } from "@/lib/realtime/socket";

/**
 * Returns 0 while Socket.IO is connected (realtime drives updates) or `fallbackMs`
 * when offline so React Query still refreshes on a slow interval.
 */
export function useRealtimeFallbackPollInterval(fallbackMs: number): number {
  const [connected, setConnected] = useState(() =>
    typeof window !== "undefined" ? isRealtimeConnected() : false,
  );

  useEffect(() => {
    const sync = () => setConnected(getRealtimeSocket().connected);
    sync();

    const offConnect = onRealtime(REALTIME_EVENTS.CONNECT, sync);
    const offDisconnect = onRealtime(REALTIME_EVENTS.DISCONNECT, () => setConnected(false));
    const offConnectError = onRealtime("connect_error", () => setConnected(false));

    return () => {
      offConnect();
      offDisconnect();
      offConnectError();
    };
  }, []);

  return connected ? 0 : fallbackMs;
}
