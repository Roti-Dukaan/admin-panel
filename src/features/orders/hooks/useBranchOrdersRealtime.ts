import { useEffect } from "react";
import { onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS, type BranchOrderUpdatedPayload } from "@/lib/realtime/events";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useOrdersStore } from "./useOrders";
import { normalizeOrderStatus } from "../utils/status";

/**
 * Live sync for the Branch Orders screen.
 * Branch managers join `branch:{id}` (not `admin:orders`), so we listen for
 * branch-scoped and kitchen ticket events to refresh the orders list.
 */
export function useBranchOrdersRealtime() {
  const accessToken = useAdminAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    // Socket connect/auth is owned globally by BranchOrderAlertProvider.
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      const store = useOrdersStore.getState();
      void store.fetchOrders();
      void store.fetchStatistics();
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        void store.fetchOrders();
        void store.fetchStatistics();
      }, 400);
    };

    const patchOrderStatus = (payload: BranchOrderUpdatedPayload) => {
      const nextStatus = normalizeOrderStatus(payload.status);
      useOrdersStore.setState((state) => ({
        orders: state.orders.map((order) =>
          order.id === payload.orderId ? { ...order, status: nextStatus } : order,
        ),
        selectedOrder:
          state.selectedOrder?.id === payload.orderId
            ? { ...state.selectedOrder, status: nextStatus }
            : state.selectedOrder,
      }));
    };

    const offBranchNew = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_NEW, () => scheduleRefresh());
    const offBranchUpdated = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_UPDATED, (raw) => {
      patchOrderStatus(raw as BranchOrderUpdatedPayload);
      scheduleRefresh();
    });
    const offKitchenUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_UPDATED, () => scheduleRefresh());

    return () => {
      offBranchNew();
      offBranchUpdated();
      offKitchenUpdated();
      if (timer) clearTimeout(timer);
    };
  }, [accessToken]);

  return {};
}
