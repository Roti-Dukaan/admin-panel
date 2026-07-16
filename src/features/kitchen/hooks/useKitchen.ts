"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { kitchenApi } from "@/lib/api/kitchen.api";
import type { KitchenStage, KitchenOrderListResponse, KitchenOrderDetail } from "@/lib/api/kitchen.api";
import type { KitchenOrderView, DeliveryKind, PaymentFilter, PrepTimeFilter } from "../types/kitchen";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { playChime, ensureNotificationPermission, showOrderNotification, unlockAudio } from "@/lib/realtime/notify";
import { REALTIME_EVENTS, type KitchenTicketCreatedPayload, type KitchenTicketUpdatedPayload, type DeliveryUpdatedPayload } from "@/lib/realtime/events";

const KITCHEN_QUERY_KEY = ["kitchen", "orders"] as const;
const AUTO_REFRESH_MS = 30_000;

export interface KitchenFilterState {
  search: string;
  deliveryKind: DeliveryKind | "all";
  payment: PaymentFilter;
  prepTime: PrepTimeFilter;
  slot: string | "all";
}

/** Kitchen queue list with search, sorting and 30s auto-refresh. */
export function useKitchenOrders(filters: KitchenFilterState) {
  return useQuery({
    queryKey: [KITCHEN_QUERY_KEY, filters],
    queryFn: () =>
      kitchenApi.listOrders({
        search: filters.search.trim() || undefined,
        sortBy: "createdAt",
        sortOrder: filters.prepTime === "oldest" ? "asc" : "desc",
        limit: 300,
      }),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
    placeholderData: keepPreviousData,
  });
}

/**
 * Batch-resolve full order detail per order. Powers the payment badge, item
 * lines, variants and special notes shown on each card, and is shared with the
 * drawer so clicking a card opens instantly.
 */
export function useKitchenDetailMap(orderIds: string[]) {
  const queries = useQueries({
    queries: orderIds.map((id) => ({
      queryKey: ["kitchen", "detail", id],
      queryFn: () => kitchenApi.getOrderDetail(id),
      staleTime: AUTO_REFRESH_MS,
      enabled: !!id,
    })),
  });

  return useMemo(() => {
    const map: Record<string, KitchenOrderDetail | undefined> = {};
    queries.forEach((q, i) => {
      if (q.data) map[orderIds[i]] = q.data;
    });
    return map;
  }, [queries, orderIds]);
}

/** Full order detail for the drawer (shares cache with the payment map). */
export function useKitchenOrderDetail(id: string | null) {
  return useQuery({
    queryKey: ["kitchen", "detail", id],
    queryFn: () => kitchenApi.getOrderDetail(id!),
    enabled: !!id,
    staleTime: AUTO_REFRESH_MS,
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

      qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((it) =>
            it.orderId === id
              ? {
                  ...it,
                  kitchenStatus: nextStatus,
                  startedPreparingAt: action === "preparing" ? stamp : it.startedPreparingAt,
                  readyAt: action === "ready" ? stamp : it.readyAt,
                }
              : it
          ),
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error("Could not update the order. Please try again.");
    },

    onSuccess: (_data, { action, id }) => {
      toast.success(action === "preparing" ? "Order moved to Preparing." : "Order marked Ready for Pickup.");
      // Only refresh the affected order's detail (so its delivery/timeline
      // reflect the new stage). The board cache is already patched optimistically,
      // so we deliberately avoid invalidating the whole list/all details here —
      // that caused a refetch storm that made cards feel slow to move.
      qc.invalidateQueries({ queryKey: ["kitchen", "detail", id] });
    },
  });
}

/**
 * Live updates for the kitchen board over Socket.IO.
 *
 * - New tickets appear instantly (the list refetches) with a single chime + a
 *   browser notification (when the tab is hidden) that opens the order on click.
 * - Stage changes (PREPARING / READY_FOR_PICKUP) patch the board cache in place
 *   so cards glide between columns with no flicker/refetch.
 * - Events are de-duped by orderId + timestamp so retries / multi-tab setups
 *   never double-apply.
 */
export function useKitchenRealtime(options?: {
  onNewOrder?: (payload: KitchenTicketCreatedPayload) => void;
}) {
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const onNewOrderRef = useRef(options?.onNewOrder);
  onNewOrderRef.current = options?.onNewOrder;

  useEffect(() => {
    // Prime the audio + notification pipeline so the first new-order chime
    // actually plays (browsers require a prior user gesture to unlock audio).
    unlockAudio();
    ensureNotificationPermission();

    const socket = connectRealtime();

    const offConnect = onRealtime(REALTIME_EVENTS.CONNECT, () => setConnected(true));
    const offDisconnect = onRealtime(REALTIME_EVENTS.DISCONNECT, () => setConnected(false));
    setConnected(socket.connected);

    const isNew = (key: string) => {
      if (seen.current.has(key)) return false;
      seen.current.add(key);
      if (seen.current.size > 200) seen.current.clear();
      return true;
    };

    const offCreated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_CREATED, (raw) => {
      const payload = raw as KitchenTicketCreatedPayload;
      const key = `${payload.orderId}:${payload.occurredAt}`;
      if (!isNew(key)) return;

      playChime();
      ensureNotificationPermission();
      if (typeof document !== "undefined" && document.hidden) {
        showOrderNotification(
          `New order ${payload.orderNumber}`,
          "A new order just arrived in the kitchen.",
          () => onNewOrderRef.current?.(payload),
        );
      }

      // Optimistically insert a minimal card so it appears instantly without
      // waiting for the full-list refetch. The refetch then fills in real data.
      qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) => {
        if (!old) return old;
        // Prevent duplicate if the card is already present
        if (old.items.some((it) => it.orderId === payload.orderId)) return old;
        const minimalItem: KitchenOrderListResponse["items"][0] = {
          orderId: payload.orderId,
          ticketId: payload.ticketId,
          ticketNumber: payload.ticketNumber,
          orderNumber: payload.orderNumber,
          kitchenStatus: "PENDING",
          stageLabel: "New Orders",
          priority: "NORMAL",
          customer: null,
          itemsCount: 0,
          totalQuantity: 0,
          deliveryType: "DELIVERY",
          orderCreatedAt: payload.occurredAt,
          timer: { elapsedMinutes: 0, preparingMinutes: null, readyDurationMinutes: null, isReady: false },
        };
        return { ...old, items: [minimalItem, ...old.items] };
      });

      // Trigger a background refetch to fill in full data
      qc.invalidateQueries({ queryKey: KITCHEN_QUERY_KEY });
      onNewOrderRef.current?.(payload);
    });

    // Listen for delivery status changes (rider arriving, arrived, picked up, etc.)
    // and invalidate the detail query so the delivery card updates in real-time.
    const offDeliveryUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_DELIVERY_UPDATED, (raw) => {
      const payload = raw as DeliveryUpdatedPayload;
      qc.invalidateQueries({ queryKey: ["kitchen", "detail", payload.orderId] });
    });

    const offUpdated = onRealtime(REALTIME_EVENTS.KITCHEN_TICKET_UPDATED, (raw) => {
      const payload = raw as KitchenTicketUpdatedPayload;
      const key = `${payload.orderId}:${payload.occurredAt}`;
      if (!isNew(key)) return;

      const stamp = payload.occurredAt;
      qc.setQueriesData<KitchenOrderListResponse>({ queryKey: KITCHEN_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((it) =>
            it.orderId === payload.orderId
              ? {
                  ...it,
                  kitchenStatus: payload.stage,
                  startedPreparingAt:
                    payload.stage === "PREPARING" ? stamp : it.startedPreparingAt,
                  readyAt: payload.stage === "READY_FOR_PICKUP" ? stamp : it.readyAt,
                }
              : it,
          ),
        };
      });
      qc.invalidateQueries({ queryKey: ["kitchen", "detail", payload.orderId] });
    });

    return () => {
      offConnect();
      offDisconnect();
      offCreated();
      offUpdated();
      offDeliveryUpdated();
      disconnectRealtime();
    };
  }, [qc]);

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
      if (filters.payment === "cod" && method !== "cod") return false;
      if (filters.payment === "paid" && method === "cod") return false;
    }
    if (filters.slot !== "all") {
      if (o.deliverySlot?.name !== filters.slot) return false;
    }
    return true;
  });
}
