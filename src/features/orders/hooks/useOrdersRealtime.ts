import { useEffect } from "react";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import { useOrdersStore } from "./useOrders";

/**
 * Live sync for the admin Orders screen. New orders and status changes from any
 * source (kitchen, other admins, customers) trigger a debounced refresh of the
 * current filtered view + statistics, so the table stays current without a
 * manual refresh.
 */
export function useAdminOrdersRealtime() {
  useEffect(() => {
    connectRealtime();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        const store = useOrdersStore.getState();
        void store.fetchOrders();
        void store.fetchStatistics();
      }, 400);
    };

    const offCreated = onRealtime(REALTIME_EVENTS.ADMIN_ORDER_CREATED, () => scheduleRefresh());
    const offUpdated = onRealtime(REALTIME_EVENTS.ADMIN_ORDER_UPDATED, () => scheduleRefresh());

    return () => {
      offCreated();
      offUpdated();
      if (timer) clearTimeout(timer);
      disconnectRealtime();
    };
  }, []);

  return {};
}
