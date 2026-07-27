"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { branchIdsMatch, normalizeBranchId } from "@/lib/realtime/branch-id";
import {
  connectRealtime,
  disconnectRealtime,
  onRealtime,
  ensureRealtimeAuth,
} from "@/lib/realtime/socket";
import {
  REALTIME_EVENTS,
  type BranchOrderNewPayload,
  type BranchOrderUpdatedPayload,
  type KitchenTicketCreatedPayload,
  type KitchenTicketUpdatedPayload,
  type DeliveryUpdatedPayload,
} from "@/lib/realtime/events";
import {
  broadcastDismissOrderAlert,
  broadcastNewOrderAlert,
  subscribeOrderAlertBroadcast,
} from "@/lib/realtime/order-alert-broadcast";
import {
  enableOrderAlerts,
  ensureNotificationPermission,
  ensureOrderRingPlaying,
  isOrderAlertsEnabled,
  onOrderAlertsEnabledChange,
  preloadOrderAudio,
  showOrderNotification,
  startOrderRing,
  stopOrderRing,
  unlockAudio,
} from "@/lib/realtime/notify";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useKitchenStageMutation } from "@/features/kitchen/hooks/useKitchen";
import {
  handleBranchOrderNew,
  handleKitchenDeliveryUpdated,
  handleKitchenTicketCreated,
  handleKitchenTicketUpdated,
  patchKitchenStageInCache,
  refetchKitchenQueries,
} from "@/features/kitchen/utils/kitchen-realtime-sync";
import {
  patchBranchDashboardOnNewOrder,
  scheduleBranchDashboardRefresh,
} from "@/features/branch-dashboard/utils/branch-dashboard-realtime-sync";
import { useOrdersStore } from "../hooks/useOrders";
import { normalizeOrderStatus } from "../utils/status";
import { NewOrderAlertModal } from "./NewOrderAlertModal";

/** Statuses where an order still counts as "new" — anything else auto-closes its alert. */
const NEW_ORDER_STATUSES = new Set(["pending-confirmation", "pending", "confirmed"]);

export function BranchOrderAlertProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { branchId: workspaceBranchId, isBranchManager } = useWorkspace();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const userBranchId = useAdminAuthStore((s) => s.user?.branchId ?? s.branchId);
  const branchId = normalizeBranchId(workspaceBranchId ?? userBranchId);
  // Newest alert first; older unhandled orders stay queued behind it.
  const [alerts, setAlerts] = useState<BranchOrderNewPayload[]>([]);
  /** Orders that must keep ringing until Start Preparing (survives dismiss). */
  const [ringingOrderIds, setRingingOrderIds] = useState<string[]>([]);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [enablingAlerts, setEnablingAlerts] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const stageMutation = useKitchenStageMutation();

  const alert = alerts[0] ?? null;
  const open = alerts.length > 0;
  const queuedCount = Math.max(0, alerts.length - 1);

  useEffect(() => {
    setAlertsEnabled(isOrderAlertsEnabled());
    return onOrderAlertsEnabledChange(() => setAlertsEnabled(true));
  }, []);

  const addRingingOrder = useCallback((orderId: string) => {
    setRingingOrderIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
  }, []);

  const clearRingingOrder = useCallback((orderId: string) => {
    setRingingOrderIds((prev) => {
      const next = prev.filter((id) => id !== orderId);
      if (next.length === 0) {
        stopOrderRing();
        setSoundBlocked(false);
      }
      return next;
    });
  }, []);

  /** Remove order from the visible modal queue only (dismiss). */
  const hideAlert = useCallback((orderId: string, broadcast = true) => {
    setAlerts((prev) => prev.filter((a) => a.orderId !== orderId));
    if (broadcast) {
      broadcastDismissOrderAlert(orderId);
    }
  }, []);

  /** Fully resolve an order — stops ring when no ringing orders remain. */
  const resolveOrder = useCallback(
    (orderId: string, options?: { broadcast?: boolean }) => {
      const broadcast = options?.broadcast ?? true;
      setAlerts((prev) => prev.filter((a) => a.orderId !== orderId));
      clearRingingOrder(orderId);
      if (broadcast) {
        broadcastDismissOrderAlert(orderId);
      }
    },
    [clearRingingOrder],
  );

  const handleEnableAlerts = useCallback(async () => {
    setEnablingAlerts(true);
    try {
      const enabled = await enableOrderAlerts();
      ensureNotificationPermission();
      if (enabled) {
        setAlertsEnabled(true);
        setSoundBlocked(false);
        toast.success("Order sound alerts enabled");
        if (open) {
          void startOrderRing().then((started) => setSoundBlocked(!started));
        }
      } else {
        toast.error("Could not enable sound. Check your browser volume and try again.");
      }
    } finally {
      setEnablingAlerts(false);
    }
  }, [open]);

  /**
   * Popup/sound only. Cache sync (orders + kitchen refetch) runs
   * UNCONDITIONALLY in the socket/broadcast handlers — it must never be
   * skipped by alert dedup, branch mismatch or disabled sound.
   */
  const showAlert = useCallback(
    (payload: BranchOrderNewPayload, options?: { broadcast?: boolean }) => {
      if (!branchIdsMatch(branchId, payload.branchId)) return;
      if (seen.current.has(payload.orderId)) return;
      seen.current.add(payload.orderId);
      // Evict oldest entries instead of wiping the set, so recent orders
      // can never re-trigger a duplicate ring.
      if (seen.current.size > 200) {
        for (const id of seen.current) {
          seen.current.delete(id);
          if (seen.current.size <= 100) break;
        }
      }

      setAlerts((prev) => [payload, ...prev.filter((a) => a.orderId !== payload.orderId)]);
      addRingingOrder(payload.orderId);

      void startOrderRing().then((started) => {
        setSoundBlocked(!started);
        if (!started) {
          toast.info("New order received — tap anywhere on the page to enable the alert sound.", {
            duration: 10000,
          });
        }
      });

      if (typeof document !== "undefined" && document.hidden) {
        showOrderNotification(
          `New order ${payload.orderNumber}`,
          payload.itemsSummary || "A new order just arrived.",
          () => router.push(`/branch/kitchen?orderId=${payload.orderId}`),
        );
      }

      if (options?.broadcast !== false) {
        broadcastNewOrderAlert(payload);
      }
    },
    [branchId, router, addRingingOrder],
  );

  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;

  const hideAlertRef = useRef(hideAlert);
  hideAlertRef.current = hideAlert;

  const resolveOrderRef = useRef(resolveOrder);
  resolveOrderRef.current = resolveOrder;

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !accessToken) {
      return;
    }

    preloadOrderAudio();
    unlockAudio();
    connectRealtime(accessToken);
    ensureRealtimeAuth(accessToken);

    return () => {
      disconnectRealtime();
    };
  }, [isBranchManager, isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !accessToken) {
      stopOrderRing();
      setAlerts([]);
      setRingingOrderIds([]);
      setSoundBlocked(false);
      return;
    }

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleOrdersRefresh = () => {
      refetchKitchenQueries(qc);
      if (refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        void useOrdersStore.getState().fetchOrders();
        void useOrdersStore.getState().fetchStatistics();
        scheduleBranchDashboardRefresh(qc);
        refetchKitchenQueries(qc);
      }, 400);
    };

    const offTicketCreated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_CREATED, (raw) => {
      handleKitchenTicketCreated(qc, raw as KitchenTicketCreatedPayload);
      scheduleOrdersRefresh();
    });

    const offBranch = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_NEW, (raw) => {
      const payload = raw as BranchOrderNewPayload;
      if (!branchIdsMatch(branchId, payload.branchId)) return;
      // Cache sync FIRST and unconditionally — the kitchen board and orders
      // list must update even when the popup is deduped or sound is off.
      handleBranchOrderNew(qc, payload);
      patchBranchDashboardOnNewOrder(qc, payload);
      scheduleOrdersRefresh();
      showAlertRef.current(payload);
    });

    const offBranchUpdated = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_UPDATED, (raw) => {
      const payload = raw as BranchOrderUpdatedPayload;
      const nextStatus = normalizeOrderStatus(payload.status);
      // Order handled elsewhere (other device/staff) — close its alert and stop ring.
      if (!NEW_ORDER_STATUSES.has(nextStatus)) {
        resolveOrderRef.current(payload.orderId, { broadcast: false });
      }
      useOrdersStore.setState((state) => ({
        orders: state.orders.map((order) =>
          order.id === payload.orderId ? { ...order, status: nextStatus } : order,
        ),
        selectedOrder:
          state.selectedOrder?.id === payload.orderId
            ? { ...state.selectedOrder, status: nextStatus }
            : state.selectedOrder,
      }));
      if (nextStatus === "preparing") {
        patchKitchenStageInCache(qc, payload.orderId, "PREPARING", payload.occurredAt);
      } else if (nextStatus === "ready-for-pickup") {
        patchKitchenStageInCache(qc, payload.orderId, "READY_FOR_PICKUP", payload.occurredAt);
      }
      scheduleOrdersRefresh();
    });

    const offKitchenUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_UPDATED, (raw) => {
      const payload = raw as KitchenTicketUpdatedPayload;
      // Kitchen already started this order — its alert is no longer "new".
      resolveOrderRef.current(payload.orderId, { broadcast: false });
      handleKitchenTicketUpdated(qc, payload);
      scheduleOrdersRefresh();
    });

    const offDeliveryUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_DELIVERY_UPDATED, (raw) => {
      handleKitchenDeliveryUpdated(qc, raw as DeliveryUpdatedPayload);
    });

    const offBroadcast = subscribeOrderAlertBroadcast({
      onNewOrder: (payload) => {
        // Another tab saw the order first — sync this tab's caches too.
        handleBranchOrderNew(qc, payload);
        patchBranchDashboardOnNewOrder(qc, payload);
        scheduleOrdersRefresh();
        showAlertRef.current(payload, { broadcast: false });
      },
      onDismissOrder: (orderId) => hideAlertRef.current(orderId, false),
    });

    return () => {
      offTicketCreated();
      offBranch();
      offBranchUpdated();
      offKitchenUpdated();
      offDeliveryUpdated();
      offBroadcast();
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [isBranchManager, isAuthenticated, branchId, accessToken, qc]);

  useEffect(() => {
    if (ringingOrderIds.length === 0) return;

    void startOrderRing().then((started) => {
      setSoundBlocked(!started);
    });

    const keepAlive = window.setInterval(ensureOrderRingPlaying, 1000);
    return () => window.clearInterval(keepAlive);
  }, [ringingOrderIds.length]);

  useEffect(() => {
    if (ringingOrderIds.length === 0 || !soundBlocked) return;

    const retrySound = () => {
      void startOrderRing().then((started) => {
        if (started) {
          setSoundBlocked(false);
          if (!isOrderAlertsEnabled()) {
            // Persist unlock after a successful gesture-triggered ring.
            void enableOrderAlerts();
          }
          setAlertsEnabled(true);
        }
      });
    };

    window.addEventListener("pointerdown", retrySound);
    window.addEventListener("keydown", retrySound);
    window.addEventListener("touchstart", retrySound);
    return () => {
      window.removeEventListener("pointerdown", retrySound);
      window.removeEventListener("keydown", retrySound);
      window.removeEventListener("touchstart", retrySound);
    };
  }, [ringingOrderIds.length, soundBlocked]);

  const dismissAlert = useCallback(
    (broadcast = true) => {
      const orderId = alert?.orderId;
      if (!orderId) return;
      hideAlert(orderId, broadcast);
    },
    [alert?.orderId, hideAlert],
  );

  const handleViewDetails = () => {
    if (!alert) return;
    // Navigate without stopping the alert ring.
    router.push(`/branch/kitchen?orderId=${alert.orderId}`);
  };

  const handleStartPreparing = () => {
    if (!alert) return;
    const orderId = alert.orderId;

    stageMutation.mutate(
      { id: orderId, action: "preparing" },
      {
        onSuccess: () => resolveOrder(orderId),
      },
    );
  };

  return (
    <>
      {children}

      {!alertsEnabled && !open && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-[200] w-[min(100%-2rem,28rem)] -translate-x-1/2 rounded-xl border border-orange-200 bg-white p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Volume2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">Enable order sound alerts</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Browsers require one click before playing alert sounds. Enable now so you hear every new order.
              </p>
              <Button
                size="sm"
                className="mt-3 w-full sm:w-auto"
                onClick={() => void handleEnableAlerts()}
                disabled={enablingAlerts}
              >
                {enablingAlerts ? "Enabling..." : "Enable Sound Alerts"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <NewOrderAlertModal
        alert={alert}
        open={open}
        queuedCount={queuedCount}
        soundBlocked={soundBlocked}
        preparing={stageMutation.isPending}
        onStartPreparing={handleStartPreparing}
        onDismiss={() => dismissAlert()}
        onViewDetails={handleViewDetails}
        onEnableSound={() => void handleEnableAlerts()}
        enablingSound={enablingAlerts}
      />
    </>
  );
}
