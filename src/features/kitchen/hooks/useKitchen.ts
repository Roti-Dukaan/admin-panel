"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { kitchenApi } from "@/lib/api/kitchen.api";
import type { KitchenStage, KitchenOrderListResponse, KitchenOrderDetail } from "@/lib/api/kitchen.api";
import type { KitchenOrderView, DeliveryKind, PaymentFilter, PrepTimeFilter } from "../types/kitchen";
import { onRealtime, getRealtimeSocket, connectRealtime } from "@/lib/realtime/socket";
import { branchIdsMatch } from "@/lib/realtime/branch-id";
import {
  mergeKitchenListResponses,
  patchKitchenDetailMapStage,
  patchKitchenListStage,
} from "../utils/kitchen-cache";
import {
  KITCHEN_QUERY_KEY,
  KITCHEN_DETAIL_QUERY_KEY,
  handleBranchOrderNew,
  handleKitchenTicketCreated,
} from "../utils/kitchen-realtime-sync";
import { ensureNotificationPermission, unlockAudio } from "@/lib/realtime/notify";
import { useRealtimeFallbackPollInterval } from "@/lib/realtime/useRealtimeFallbackPollInterval";
import {
  REALTIME_EVENTS,
  type BranchOrderNewPayload,
  type KitchenTicketCreatedPayload,
} from "@/lib/realtime/events";
import { resolveOrderAlert } from "@/lib/realtime/order-alert-actions";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { isCodPayment } from "@/features/orders/utils/order-alert-format";
import { isKitchenBoardVisible, isScheduledBranchOrder } from "../utils/kitchen-scheduling";

const REALTIME_STALE_MS = 5_000;
const FALLBACK_POLL_MS = 5_000;

export interface KitchenFilterState {
  search: string;
  deliveryKind: DeliveryKind | "all";
  payment: PaymentFilter;
  prepTime: PrepTimeFilter;
  slot: string | "all";
}

/** Primitive query-key suffix — avoids unstable object identity in query keys. */
export function kitchenFiltersQueryKey(filters: KitchenFilterState) {
  return [
    filters.search,
    filters.deliveryKind,
    filters.payment,
    filters.prepTime,
    filters.slot,
  ] as const;
}

/** Kitchen queue list with search, sorting and slow fallback poll (realtime is primary). */
export function useKitchenOrders(filters: KitchenFilterState) {
  const pollInterval = useRealtimeFallbackPollInterval(FALLBACK_POLL_MS);

  return useQuery({
    queryKey: [...KITCHEN_QUERY_KEY, ...kitchenFiltersQueryKey(filters)],
    queryFn: () =>
      kitchenApi.listOrders({
        search: filters.search.trim() || undefined,
        sortBy: "createdAt",
        sortOrder: filters.prepTime === "oldest" ? "asc" : "desc",
        limit: 300,
      }),
    staleTime: REALTIME_STALE_MS,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    structuralSharing: (oldData, newData) =>
      mergeKitchenListResponses(
        oldData as KitchenOrderListResponse | undefined,
        newData as KitchenOrderListResponse,
      ),
  });
}

/**
 * Batch-resolve full order detail per order. Powers the payment badge, item
 * lines, variants and special notes shown on each card, and is shared with the
 * drawer so clicking a card opens instantly.
 *
 * Uses a single POST /admin/kitchen/orders/batch call instead of N individual
 * GET requests. Realtime Socket.IO events trigger refetch — no polling.
 */
export function useKitchenDetailMap(orderIds: string[]) {
  const sortedIds = useMemo(() => [...orderIds].sort(), [orderIds]);

  return useQuery({
    queryKey: [...KITCHEN_DETAIL_QUERY_KEY, sortedIds] as const,
    queryFn: () => kitchenApi.batchGetOrderDetails(sortedIds),
    staleTime: REALTIME_STALE_MS,
    enabled: sortedIds.length > 0,
    placeholderData: keepPreviousData,
  }).data ?? {};
}

/** Full order detail for the drawer (shares cache with the payment map). */
export function useKitchenOrderDetail(id: string | null) {
  return useQuery({
    queryKey: ["kitchen", "detail", id],
    queryFn: () => kitchenApi.getOrderDetail(id!),
    enabled: !!id,
    staleTime: REALTIME_STALE_MS,
  });
}

/**
 * Optimistic stage transition (PENDING → PREPARING → READY_FOR_PICKUP).
 * Updates the board cache immediately so cards move columns without waiting
 * for the network; rolls back on error.
 */
export function useKitchenStageMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "preparing" | "ready" }) =>
      action === "preparing" ? kitchenApi.markPreparing(id) : kitchenApi.markReady(id),

    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: KITCHEN_QUERY_KEY });
      const previous = qc.getQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY });

      const nextStatus: KitchenStage = action === "preparing" ? "PREPARING" : "READY_FOR_PICKUP";
      const stamp = new Date().toISOString();

      qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) =>
        patchKitchenListStage(old, id, nextStatus, stamp),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error("Could not update the order. Please try again.");
    },

    onSuccess: (data) => {
      qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) =>
        patchKitchenListStage(old, data.orderId, data.stage, data.occurredAt),
      );
      qc.setQueriesData<Record<string, KitchenOrderDetail>>({ queryKey: KITCHEN_DETAIL_QUERY_KEY }, (old) =>
        patchKitchenDetailMapStage(old, data),
      );

      if (data.stage === "PREPARING") {
        resolveOrderAlert(data.orderId);
      }

      toast.success(
        data.stage === "PREPARING"
          ? "Order moved to Preparing."
          : "Order marked Ready for Pickup.",
      );
      qc.invalidateQueries({ queryKey: ["kitchen", "detail", data.orderId] });
    },
  });
}

/**
 * Kitchen board socket lifecycle + cache sync fallback.
 *
 * BranchOrderAlertProvider also connects globally; this hook keeps the board
 * live when that provider remounts late (auth rehydrate) or misses an event.
 */
export function useKitchenRealtime(options?: {
  onNewOrder?: (payload: KitchenTicketCreatedPayload) => void;
}) {
  const qc = useQueryClient();
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const { branchId: workspaceBranchId, isBranchManager } = useWorkspace();
  const userBranchId = useAdminAuthStore((s) => s.user?.branchId ?? s.branchId);
  const branchId = workspaceBranchId ?? userBranchId;
  const [connected, setConnected] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const onNewOrderRef = useRef(options?.onNewOrder);
  onNewOrderRef.current = options?.onNewOrder;

  useEffect(() => {
    if (!accessToken) return;

    unlockAudio();
    ensureNotificationPermission();
    connectRealtime(accessToken);

    // Connection lifecycle is owned globally by BranchOrderAlertProvider.
    const socket = getRealtimeSocket();

    const offConnect = onRealtime(REALTIME_EVENTS.CONNECT, () => setConnected(true));
    const offDisconnect = onRealtime(REALTIME_EVENTS.DISCONNECT, () => setConnected(false));
    setConnected(socket.connected);

    const offBranchNew = onRealtime(REALTIME_EVENTS.BRANCH_ORDER_NEW, (raw) => {
      const payload = raw as BranchOrderNewPayload;
      if (isBranchManager && !branchIdsMatch(branchId, payload.branchId)) return;
      if (isScheduledBranchOrder(payload)) return;
      handleBranchOrderNew(qc, payload);
    });

    const offCreated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_CREATED, (raw) => {
      const payload = raw as KitchenTicketCreatedPayload;
      handleKitchenTicketCreated(qc, payload);
      const key = `${payload.orderId}:${payload.occurredAt}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);
      if (seen.current.size > 200) seen.current.clear();
      onNewOrderRef.current?.(payload);
    });

    return () => {
      offConnect();
      offDisconnect();
      offBranchNew();
      offCreated();
    };
  }, [accessToken, branchId, isBranchManager, qc]);

  return { connected };
}

/** Apply client-side delivery-kind + payment filters to enriched orders. */
export function applyKitchenFilters(
  orders: KitchenOrderView[],
  filters: KitchenFilterState,
  detailMap: Record<string, KitchenOrderDetail | undefined>
): KitchenOrderView[] {
  return orders.filter((o) => {
    if (filters.deliveryKind !== "all") {
      const isScheduled = !!o.deliverySlot;
      if (filters.deliveryKind === "scheduled" && !isScheduled) return false;
      if (filters.deliveryKind === "quick" && isScheduled) return false;
    }
    if (filters.payment !== "all") {
      const method = detailMap[o.orderId]?.payment?.paymentMethod ?? o.paymentMethod ?? null;
      const cod = isCodPayment(method ?? undefined);
      if (filters.payment === "cod" && !cod) return false;
      if (filters.payment === "paid" && cod) return false;
    }
    if (filters.slot !== "all") {
      if (o.deliverySlot?.name !== filters.slot) return false;
    }
    if (!isKitchenBoardVisible(o)) return false;
    return true;
  });
}
