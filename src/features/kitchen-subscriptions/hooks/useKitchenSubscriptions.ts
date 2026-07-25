"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { kitchenSubscriptionsApi, type SubscriptionKitchenQuery } from "../services/kitchen-subscriptions.api";
import type { SubscriptionOrderListResponse, SubscriptionKitchenStage, MealSlot } from "../types/kitchen-subscriptions";
import { connectRealtime, disconnectRealtime, onRealtime } from "@/lib/realtime/socket";
import { playChime, ensureNotificationPermission, unlockAudio } from "@/lib/realtime/notify";

const SUBSCRIPTIONS_QUERY_KEY = ["kitchen", "subscriptions"] as const;
const SUBSCRIPTIONS_SUMMARY_KEY = ["kitchen", "subscriptions", "summary"] as const;
const AUTO_REFRESH_MS = 30_000;

export interface SubscriptionFilterState {
  search: string;
  mealSlot: MealSlot;
  status: SubscriptionKitchenStage | "all";
}

/** Fetch today's subscription orders for the kitchen queue. */
export function useSubscriptionOrders(filters: SubscriptionFilterState) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, filters],
    queryFn: () =>
      kitchenSubscriptionsApi.listOrders({
        search: filters.search.trim() || undefined,
        mealSlot: filters.mealSlot,
        status: filters.status === "all" ? undefined : filters.status,
        limit: 200,
        sortOrder: "asc",
      }),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
    placeholderData: keepPreviousData,
  });
}

/** Fetch production summary. */
export function useSubscriptionSummary() {
  return useQuery({
    queryKey: SUBSCRIPTIONS_SUMMARY_KEY,
    queryFn: () => kitchenSubscriptionsApi.getSummary(),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
  });
}

/** Full order detail for the drawer. */
export function useSubscriptionOrderDetail(id: string | null) {
  return useQuery({
    queryKey: ["kitchen", "subscription-detail", id],
    queryFn: () => kitchenSubscriptionsApi.getOrderDetail(id!),
    enabled: !!id,
    staleTime: AUTO_REFRESH_MS,
  });
}

/** Optimistic ready-for-dispatch mutation. */
export function useSubscriptionStageMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      kitchenSubscriptionsApi.markReadyForDispatch(id, remark),

    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      const previous = qc.getQueriesData<SubscriptionOrderListResponse>({ queryKey: SUBSCRIPTIONS_QUERY_KEY });

      qc.setQueriesData<SubscriptionOrderListResponse>({ queryKey: SUBSCRIPTIONS_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((it) =>
            it.orderId === id
              ? { ...it, stage: "READY_FOR_DISPATCH" as SubscriptionKitchenStage }
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

    onSuccess: () => {
      toast.success("Order marked Ready for Dispatch.");
    },
  });
}

/** Real-time updates for subscription kitchen orders. */
export function useSubscriptionRealtime(options?: {
  onNewOrder?: (payload: { orderId: string; orderNumber: string; mealSlot: string }) => void;
}) {
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const onNewOrderRef = useRef(options?.onNewOrder);
  onNewOrderRef.current = options?.onNewOrder;

  useEffect(() => {
    unlockAudio();
    ensureNotificationPermission();

    const socket = connectRealtime();

    const offConnect = onRealtime("connect", () => setConnected(true));
    const offDisconnect = onRealtime("disconnect", () => setConnected(false));
    setConnected(socket.connected);

    const isNew = (key: string) => {
      if (seen.current.has(key)) return false;
      seen.current.add(key);
      if (seen.current.size > 200) seen.current.clear();
      return true;
    };

    const offCreated = onRealtime("subscription:order_created", (raw) => {
      const payload = raw as { orderId: string; orderNumber: string; mealSlot: string; occurredAt: string };
      const key = `${payload.orderId}:${payload.occurredAt}`;
      if (!isNew(key)) return;

      playChime();
      if (typeof document !== "undefined" && document.hidden) {
        ensureNotificationPermission();
      }

      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      onNewOrderRef.current?.(payload);
    });

    const offUpdated = onRealtime("subscription:order_updated", (raw) => {
      const payload = raw as { orderId: string; status: string; occurredAt: string };
      const key = `${payload.orderId}:${payload.occurredAt}`;
      if (!isNew(key)) return;

      qc.setQueriesData<SubscriptionOrderListResponse>({ queryKey: SUBSCRIPTIONS_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((it) =>
            it.orderId === payload.orderId
              ? { ...it, stage: payload.status as SubscriptionKitchenStage }
              : it
          ),
        };
      });
    });

    return () => {
      offConnect();
      offDisconnect();
      offCreated();
      offUpdated();
      disconnectRealtime();
    };
  }, [qc]);

  return { connected };
}
