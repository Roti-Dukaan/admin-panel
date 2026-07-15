import { useEffect } from "react";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS } from "@/lib/realtime/events";

/**
 * Live sync for the admin Delivery Management screen. Any delivery lifecycle
 * change (created, advanced, cancelled — from any admin or the system) triggers
 * a debounced refresh of the current view so dispatchers see updates instantly.
 */
export function useDeliveriesRealtime(onUpdate: () => void) {
  useEffect(() => {
    connectRealtime();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        onUpdate();
      }, 400);
    };

    const offUpdated = onRealtime(REALTIME_EVENTS.ADMIN_DELIVERY_UPDATED, () => scheduleRefresh());

    return () => {
      offUpdated();
      if (timer) clearTimeout(timer);
      disconnectRealtime();
    };
  }, [onUpdate]);

  return {};
}
