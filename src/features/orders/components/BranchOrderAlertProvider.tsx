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
  broadcastResolveOrderAlert,
  subscribeOrderAlertBroadcast,
} from "@/lib/realtime/order-alert-broadcast";
import {
  registerOrderAlertActions,
  unregisterOrderAlertActions,
} from "@/lib/realtime/order-alert-actions";
import {
  enableOrderAlerts,
  ensureNotificationPermission,
  ensureOrderRingPlaying,
  ensureAudioLoaded,
  isOrderAlertsEnabled,
  isOrderAlertsVerifiedThisSession,
  onOrderAlertsEnabledChange,
  onOrderAlertsVerifiedSessionChange,
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
  handleBranchOrderStatusUpdated,
  handleKitchenDeliveryUpdated,
  handleKitchenTicketCreated,
  handleKitchenTicketUpdated,
  patchKitchenStageInCache,
  refetchKitchenQueries,
} from "@/features/kitchen/utils/kitchen-realtime-sync";
import { isScheduledBranchOrder } from "@/features/kitchen/utils/kitchen-scheduling";
import {
  patchBranchDashboardOnNewOrder,
  scheduleBranchDashboardRefresh,
} from "@/features/branch-dashboard/utils/branch-dashboard-realtime-sync";
import { useOrdersStore } from "../hooks/useOrders";
import { useGlobalPendingOrderPoll } from "../hooks/useGlobalPendingOrderPoll";
import { normalizeOrderStatus } from "../utils/status";
import { NewOrderAlertModal } from "./NewOrderAlertModal";

/** Statuses where an order still counts as "new" — anything else auto-closes its alert. */
const NEW_ORDER_STATUSES = new Set([
  "pending-confirmation",
  "pending",
  "confirmed",
  "accepted",
]);

function ticketToAlertPayload(
  ticket: KitchenTicketCreatedPayload,
  branchId: string,
): BranchOrderNewPayload {
  return {
    orderId: ticket.orderId,
    orderNumber: ticket.orderNumber,
    status: ticket.stage,
    occurredAt: ticket.occurredAt,
    branchId: ticket.branchId ?? branchId,
    itemsSummary: ticket.itemsSummary ?? "New kitchen order",
    itemCount: ticket.itemCount ?? 0,
    grandTotal: ticket.grandTotal ?? 0,
    paymentMethod: ticket.paymentMethod,
    deliveryType: ticket.deliveryType,
  };
}

export function BranchOrderAlertProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { branchId: workspaceBranchId, isBranchManager } = useWorkspace();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const userBranchId = useAdminAuthStore((s) => s.user?.branchId ?? s.branchId);
  const branchId = normalizeBranchId(workspaceBranchId ?? userBranchId);
  const missingBranchAssignment = isBranchManager && isAuthenticated && !branchId;
  // Newest alert first; older unhandled orders stay queued behind it.
  const [alerts, setAlerts] = useState<BranchOrderNewPayload[]>([]);
  /** Orders that must keep ringing until Start Preparing (survives dismiss). */
  const [ringingOrderIds, setRingingOrderIds] = useState<string[]>([]);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertsVerifiedSession, setAlertsVerifiedSession] = useState(false);
  const [enablingAlerts, setEnablingAlerts] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const placementSeen = useRef<Set<string>>(new Set());
  const stageMutation = useKitchenStageMutation();

  const alert = alerts[0] ?? null;
  const open = alerts.length > 0;
  const queuedCount = Math.max(0, alerts.length - 1);

  useEffect(() => {
    setAlertsEnabled(isOrderAlertsEnabled());
    setAlertsVerifiedSession(isOrderAlertsVerifiedThisSession());
    const offEnabled = onOrderAlertsEnabledChange(() => setAlertsEnabled(true));
    const offVerified = onOrderAlertsVerifiedSessionChange(() => setAlertsVerifiedSession(true));
    return () => {
      offEnabled();
      offVerified();
    };
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
        broadcastResolveOrderAlert(orderId);
      }
    },
    [clearRingingOrder],
  );

  const beginRingForOrder = useCallback((orderId: string) => {
    addRingingOrder(orderId);
    void (async () => {
      await ensureAudioLoaded();
      if (isOrderAlertsEnabled()) {
        const started = await startOrderRing();
        setSoundBlocked(!started);
        if (!started) {
          toast.info("New order — click Enable Order Alert or tap anywhere on the page.", {
            duration: 10000,
          });
        }
        return;
      }
      const started = await startOrderRing();
      setSoundBlocked(!started);
      if (!started) {
        toast.info("New order — click Enable Order Alert to allow the ringtone.", {
          duration: 10000,
        });
      }
    })();
  }, [addRingingOrder]);

  const handleEnableAlerts = useCallback(async () => {
    setEnablingAlerts(true);
    try {
      const loaded = await ensureAudioLoaded();
      if (!loaded) {
        toast.error("Could not load ringing_old_phone.mp3 — check public/sounds/ folder.");
        return;
      }
      const enabled = await enableOrderAlerts();
      ensureNotificationPermission();
      if (enabled) {
        setAlertsEnabled(true);
        setAlertsVerifiedSession(true);
        setSoundBlocked(false);
        toast.success("Sound enabled — you should hear the ringtone for 3 seconds.");
        if (ringingOrderIds.length > 0 || open) {
          void startOrderRing().then((started) => setSoundBlocked(!started));
        }
      } else {
        toast.error("Could not play sound. Unmute this tab and check system volume.");
      }
    } finally {
      setEnablingAlerts(false);
    }
  }, [open, ringingOrderIds.length]);

  /**
   * Popup/sound only. Cache sync (orders + kitchen refetch) runs
   * UNCONDITIONALLY in the socket/broadcast handlers — it must never be
   * skipped by alert dedup, branch mismatch or disabled sound.
   */
  const showAlert = useCallback(
    (
      payload: BranchOrderNewPayload,
      options?: { broadcast?: boolean; forceAlert?: boolean },
    ) => {
      if (!branchIdsMatch(branchId, payload.branchId)) return;

      const alreadyAlerted = seen.current.has(payload.orderId);
      if (alreadyAlerted && !options?.forceAlert) {
        beginRingForOrder(payload.orderId);
        return;
      }

      if (!alreadyAlerted) {
        seen.current.add(payload.orderId);
        if (seen.current.size > 200) {
          for (const id of seen.current) {
            seen.current.delete(id);
            if (seen.current.size <= 100) break;
          }
        }
      }

      setAlerts((prev) => [payload, ...prev.filter((a) => a.orderId !== payload.orderId)]);
      beginRingForOrder(payload.orderId);

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
    [branchId, router, beginRingForOrder],
  );

  const ensureRinging = useCallback(
    (orderId: string) => {
      beginRingForOrder(orderId);
    },
    [beginRingForOrder],
  );

  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;

  const hideAlertRef = useRef(hideAlert);
  hideAlertRef.current = hideAlert;

  const resolveOrderRef = useRef(resolveOrder);
  resolveOrderRef.current = resolveOrder;

  const qcRef = useRef(qc);
  qcRef.current = qc;

  const branchIdRef = useRef(branchId);
  branchIdRef.current = branchId;

  // Poll pending kitchen orders on every page — not only /branch/kitchen.
  useGlobalPendingOrderPoll(
    isBranchManager && isAuthenticated && !!accessToken,
    branchId,
    (payload) => showAlertRef.current(payload, { forceAlert: true, broadcast: true }),
  );

  // Own the shared socket lifecycle once per branch-manager session. Token
  // refreshes are applied via ensureRealtimeAuth so we do not disconnect on
  // every accessToken change (that dropped refCount and forced 60s polling).
  useEffect(() => {
    registerOrderAlertActions({
      resolveOrder: (orderId) => resolveOrderRef.current(orderId),
      ensureRinging: (orderId) => ensureRinging(orderId),
      alertNewOrder: (payload) => showAlertRef.current(payload, { forceAlert: true, broadcast: true }),
    });
    return () => unregisterOrderAlertActions();
  }, [ensureRinging]);

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated) {
      stopOrderRing();
      setAlerts([]);
      setRingingOrderIds([]);
      setSoundBlocked(false);
    }
  }, [isBranchManager, isAuthenticated]);

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !accessToken) return;

    preloadOrderAudio();
    unlockAudio();
    connectRealtime(accessToken);
  }, [isBranchManager, isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !accessToken) return;
    ensureRealtimeAuth(accessToken);
  }, [isBranchManager, isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isBranchManager || !isAuthenticated || !accessToken) return;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleOrdersRefresh = () => {
      refetchKitchenQueries(qcRef.current);
      if (refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        void useOrdersStore.getState().fetchOrders();
        void useOrdersStore.getState().fetchStatistics();
        scheduleBranchDashboardRefresh(qcRef.current);
        refetchKitchenQueries(qcRef.current);
      }, 400);
    };

    const offTicketCreated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_CREATED, (raw) => {
      const ticket = raw as KitchenTicketCreatedPayload;
      handleKitchenTicketCreated(qcRef.current, ticket);
      scheduleOrdersRefresh();

      const alertPayload = ticketToAlertPayload(
        ticket,
        branchIdRef.current ?? ticket.branchId ?? "",
      );
      showAlertRef.current(alertPayload, {
        forceAlert: true,
        broadcast: false,
      });
    });

    const offBranch = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_NEW, (raw) => {
      const payload = raw as BranchOrderNewPayload;
      if (!branchIdsMatch(branchIdRef.current, payload.branchId)) return;
      if (!isScheduledBranchOrder(payload)) {
        handleBranchOrderNew(qcRef.current, payload);
      }
      patchBranchDashboardOnNewOrder(qcRef.current, payload);
      scheduleOrdersRefresh();

      if (isScheduledBranchOrder(payload)) {
        placementSeen.current.add(payload.orderId);
      }

      showAlertRef.current(payload);
    });

    const offBranchUpdated = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_UPDATED, (raw) => {
      const payload = raw as BranchOrderUpdatedPayload;
      const nextStatus = normalizeOrderStatus(payload.status);
      if (!NEW_ORDER_STATUSES.has(nextStatus)) {
        resolveOrderRef.current(payload.orderId, { broadcast: true });
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
        patchKitchenStageInCache(qcRef.current, payload.orderId, "PREPARING", payload.occurredAt);
      } else if (nextStatus === "ready-for-pickup") {
        patchKitchenStageInCache(qcRef.current, payload.orderId, "READY_FOR_PICKUP", payload.occurredAt);
      } else if (nextStatus === "cancelled" || nextStatus === "failed") {
        handleBranchOrderStatusUpdated(qcRef.current, payload.orderId, payload.status);
      }
      scheduleOrdersRefresh();
    });

    const offKitchenUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_UPDATED, (raw) => {
      const payload = raw as KitchenTicketUpdatedPayload;
      resolveOrderRef.current(payload.orderId, { broadcast: true });
      handleKitchenTicketUpdated(qcRef.current, payload);
      scheduleOrdersRefresh();
    });

    const offDeliveryUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_DELIVERY_UPDATED, (raw) => {
      handleKitchenDeliveryUpdated(qcRef.current, raw as DeliveryUpdatedPayload);
    });

    const offBroadcast = subscribeOrderAlertBroadcast({
      onNewOrder: (payload) => {
        if (!isScheduledBranchOrder(payload)) {
          handleBranchOrderNew(qcRef.current, payload);
        }
        patchBranchDashboardOnNewOrder(qcRef.current, payload);
        scheduleOrdersRefresh();
        if (isScheduledBranchOrder(payload)) {
          placementSeen.current.add(payload.orderId);
        }
        showAlertRef.current(payload, { broadcast: false });
      },
      onDismissOrder: (orderId) => hideAlertRef.current(orderId, false),
      onResolveOrder: (orderId) => resolveOrderRef.current(orderId, { broadcast: false }),
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
  }, [isBranchManager, isAuthenticated, accessToken]);

  useEffect(() => {
    if (ringingOrderIds.length === 0) return;

    void startOrderRing().then((started) => {
      setSoundBlocked(!started);
    });

    const keepAlive = window.setInterval(ensureOrderRingPlaying, 1000);
    return () => window.clearInterval(keepAlive);
  }, [ringingOrderIds.length]);

  useEffect(() => {
    if (ringingOrderIds.length === 0) return;

    const retrySound = () => {
      void (async () => {
        if (!isOrderAlertsEnabled()) {
          const enabled = await enableOrderAlerts();
          if (enabled) setAlertsEnabled(true);
        }
        const started = await startOrderRing();
        if (started) setSoundBlocked(false);
      })();
    };

    window.addEventListener("pointerdown", retrySound, { capture: true });
    window.addEventListener("keydown", retrySound, { capture: true });
    window.addEventListener("touchstart", retrySound, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", retrySound, { capture: true });
      window.removeEventListener("keydown", retrySound, { capture: true });
      window.removeEventListener("touchstart", retrySound, { capture: true });
    };
  }, [ringingOrderIds.length]);

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

    void enableOrderAlerts().then(() => setAlertsEnabled(true));

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

      {missingBranchAssignment && (
        <div
          role="alert"
          className="fixed top-4 left-1/2 z-[200] w-[min(100%-2rem,32rem)] -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 p-4 shadow-lg"
        >
          <p className="text-sm font-semibold text-red-900">Branch not assigned to your account</p>
          <p className="mt-1 text-xs text-red-800">
            Order alerts and sounds will not work until a Super Admin links your manager account to a branch.
          </p>
        </div>
      )}

      {(!alertsVerifiedSession || (soundBlocked && ringingOrderIds.length > 0)) && !missingBranchAssignment && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-[200] w-[min(100%-2rem,28rem)] -translate-x-1/2 rounded-xl border border-orange-200 bg-white p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Volume2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {soundBlocked ? "Order alert is blocked" : "Enable order alert sound"}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {soundBlocked
                  ? "Click below or tap anywhere on the page to allow the ringtone for new orders."
                  : "Click Enable — you should hear ringing_old_phone.mp3 for 3 seconds. Required once per browser."}
              </p>
              <Button
                size="sm"
                className="mt-3 w-full sm:w-auto"
                onClick={() => void handleEnableAlerts()}
                disabled={enablingAlerts}
              >
                {enablingAlerts ? "Enabling..." : soundBlocked ? "Allow Order Alert" : "Enable Order Alert"}
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
