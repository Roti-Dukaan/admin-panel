"use client";

import { useEffect, useState } from "react";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import { getRealtimeSocket, isRealtimeConnected, onRealtime } from "@/lib/realtime/socket";

/**
 * Read-only connection indicator — does not connect/disconnect the shared socket.
 * Realtime lifecycle is owned by BranchOrderAlertProvider and feature hooks.
 */
export function useRealtimeConnectionStatus(): boolean {
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

  return connected;
}
