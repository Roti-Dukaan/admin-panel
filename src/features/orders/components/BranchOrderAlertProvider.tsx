"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  isOrderAlertsEnabled,
  onOrderAlertsEnabledChange,
  preloadOrderAudio,
  showOrderNotification,
  stopOrderRing,
  tryStartOrderRing,
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
} from "@/features/kitchen/utils/kitchen-realtime-sync";
import { useOrdersStore } from "../hooks/useOrders";
import { normalizeOrderStatus } from "../utils/status";
import { NewOrderAlertModal } from "./NewOrderAlertModal";

/** Statuses where an order still counts as "new" — anything else auto-closes its alert. */
const NEW_ORDER_STATUSES = new Set(["pending-confirmation", "pending", "confirmed"]);

export function BranchOrderAlertProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { branchId, isBranchManager } = useWorkspace();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  // Newest alert first; older unhandled orders stay queued behind it.
  const [alerts, setAlerts] = useState<BranchOrderNewPayload[]>([]);
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

  /**
   * Remove one order from the alert queue. The ring only stops when no
   * alerted orders remain; otherwise the next queued order takes over.
   */
  const removeAlert = useCallback((orderId: string, broadcast = true) => {
    setAlerts((prev) => {
      if (!prev.some((a) => a.orderId === orderId)) return prev;
      const next = prev.filter((a) => a.orderId !== orderId);
      if (next.length === 0) {
        stopOrderRing();
        setSoundBlocked(false);
      }
      return next;
    });
    if (broadcast) {
      broadcastDismissOrderAlert(orderId);
    }
  }, []);

  const dismissAlert = useCallback(
    (broadcast = true) => {
      const orderId = alert?.orderId;
      if (!orderId) return;
      removeAlert(orderId, broadcast);
    },
    [alert?.orderId, removeAlert],
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
          void tryStartOrderRing().then((started) => setSoundBlocked(!started));
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
      if (!branchId || payload.branchId !== branchId) return;
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

      void tryStartOrderRing().then((started) => {
        setSoundBlocked(!started);
        if (!started) {
          toast.info("New order received — click Enable Sound to hear the alert.", {
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
    [branchId, router],
  );

  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;

  const removeAlertRef = useRef(removeAlert);
  removeAlertRef.current = removeAlert;

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !branchId || !accessToken) {
      return;
    }

    preloadOrderAudio();
    unlockAudio();
    connectRealtime();
    ensureRealtimeAuth(accessToken);

    return () => {
      disconnectRealtime();
    };
  }, [isBranchManager, isAuthenticated, branchId, accessToken]);

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !branchId || !accessToken) {
      stopOrderRing();
      setAlerts([]);
      setSoundBlocked(false);
      return;
    }

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleOrdersRefresh = () => {
      if (refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        void useOrdersStore.getState().fetchOrders();
        void useOrdersStore.getState().fetchStatistics();
      }, 400);
    };

    const offTicketCreated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_CREATED, (raw) => {
      handleKitchenTicketCreated(qc, raw as KitchenTicketCreatedPayload);
      scheduleOrdersRefresh();
    });

    const offBranch = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_NEW, (raw) => {
      const payload = raw as BranchOrderNewPayload;
      // Cache sync FIRST and unconditionally — the kitchen board and orders
      // list must update even when the popup is deduped or sound is off.
      handleBranchOrderNew(qc, payload);
      scheduleOrdersRefresh();
      showAlertRef.current(payload);
    });

    const offBranchUpdated = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_UPDATED, (raw) => {
      const payload = raw as BranchOrderUpdatedPayload;
      const nextStatus = normalizeOrderStatus(payload.status);
      // Order handled elsewhere (other device/staff) — close its alert;
      // ring stops automatically once no alerted orders remain.
      if (!NEW_ORDER_STATUSES.has(nextStatus)) {
        removeAlertRef.current(payload.orderId, false);
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
      removeAlertRef.current(payload.orderId, false);
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
        scheduleOrdersRefresh();
        showAlertRef.current(payload, { broadcast: false });
      },
      onDismissOrder: (orderId) => removeAlertRef.current(orderId, false),
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
    if (!open || !soundBlocked || alertsEnabled) return;

    const retrySound = () => {
      void enableOrderAlerts().then((enabled) => {
        if (enabled) {
          setAlertsEnabled(true);
          void tryStartOrderRing().then((started) => setSoundBlocked(!started));
        }
      });
    };

    window.addEventListener("pointerdown", retrySound);
    window.addEventListener("keydown", retrySound);
    return () => {
      window.removeEventListener("pointerdown", retrySound);
      window.removeEventListener("keydown", retrySound);
    };
  }, [open, soundBlocked, alertsEnabled]);

  const handleViewDetails = () => {
    if (!alert) return;
    dismissAlert();
    router.push(`/branch/kitchen?orderId=${alert.orderId}`);
  };

  const handleStartPreparing = () => {
    if (!alert) return;
    const orderId = alert.orderId;

    stageMutation.mutate(
      { id: orderId, action: "preparing" },
      {
        onSuccess: () => removeAlert(orderId),
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
