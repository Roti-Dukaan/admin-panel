"use client";

import { useMemo } from "react";
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

    onSuccess: (_data, { action }) => {
      toast.success(action === "preparing" ? "Order moved to Preparing." : "Order marked Ready for Pickup.");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: KITCHEN_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["kitchen", "detail"] });
    },
  });
}

/**
 * Placeholder for the next-phase realtime layer. The dashboard is architected
 * so the board can subscribe to kitchen events here without touching business
 * logic or the API routes.
 */
export function useKitchenRealtime() {
  return { connected: false, enabled: false };
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
