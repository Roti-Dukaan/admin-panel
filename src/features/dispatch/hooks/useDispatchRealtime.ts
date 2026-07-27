"use client";

import { useEffect } from "react";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import { useQueryClient } from "@tanstack/react-query";

export function useDispatchRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    connectRealtime();

    const offBatchStatus = onRealtime(
      REALTIME_EVENTS.ADMIN_DISPATCH_BATCH_STATUS_UPDATED,
      () => {
        qc.invalidateQueries({ queryKey: ["dispatch", "batches"] });
        qc.invalidateQueries({ queryKey: ["dispatch", "dashboard"] });
      },
    );

    return () => {
      offBatchStatus();
      disconnectRealtime();
    };
  }, [qc]);

  return {};
}