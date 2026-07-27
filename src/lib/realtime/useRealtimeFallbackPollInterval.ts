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
    setConnected(getRealtimeSocket().connected);

    const offConnect = onRealtime(REALTIME_EVENTS.CONNECT, () => setConnected(true));
    const offDisconnect = onRealtime(REALTIME_EVENTS.DISCONNECT, () => setConnected(false));

    return () => {
      offConnect();
      offDisconnect();
    };
  }, []);

  return connected ? 0 : fallbackMs;
}
