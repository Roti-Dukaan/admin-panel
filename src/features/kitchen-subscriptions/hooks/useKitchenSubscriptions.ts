"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  kitchenSubscriptionsApi,
  type SubscriptionKitchenQuery,
} from "../services/kitchen-subscriptions.api";
import type { SubscriptionPrepRow } from "../types/kitchen-subscriptions";

const SUMMARY_KEY = ["branch", "subscription-kitchen", "summary"] as const;
const PREP_LIST_KEY = ["branch", "subscription-kitchen", "prep-list"] as const;
const DISPATCH_KEY = ["branch", "subscription-kitchen", "dispatch-ready"] as const;
const AUTO_REFRESH_MS = 30_000;

export interface SubscriptionPrepFilters {
  date: string;
  slotId: string;
  search: string;
}

export function useSubscriptionKitchenSummary(date: string) {
  return useQuery({
    queryKey: [...SUMMARY_KEY, date],
    queryFn: () => kitchenSubscriptionsApi.getKitchenSummary({ date }),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
  });
}

export function useSubscriptionPrepList(filters: SubscriptionPrepFilters) {
  return useQuery({
    queryKey: [...PREP_LIST_KEY, filters],
    queryFn: () =>
      kitchenSubscriptionsApi.getPrepList({
        date: filters.date,
        slotId: filters.slotId === "all" ? undefined : filters.slotId,
        search: filters.search.trim() || undefined,
      }),
    staleTime: AUTO_REFRESH_MS,
    refetchInterval: AUTO_REFRESH_MS,
    placeholderData: keepPreviousData,
  });
}

export function useSubscriptionDispatchReady(date: string, enabled = false) {
  return useQuery({
    queryKey: [...DISPATCH_KEY, date],
    queryFn: () => kitchenSubscriptionsApi.getDispatchReady({ date }),
    enabled,
    staleTime: AUTO_REFRESH_MS,
  });
}

type StatusAction = "prep" | "pack" | "dispatch";

export function useSubscriptionStatusMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: StatusAction }) => {
      if (action === "prep") return kitchenSubscriptionsApi.markPrepStatus(id);
      if (action === "pack") return kitchenSubscriptionsApi.markPackingStatus(id);
      return kitchenSubscriptionsApi.markDispatchStatus(id);
    },

    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: PREP_LIST_KEY });
      const previous = qc.getQueriesData<SubscriptionPrepRow[]>({ queryKey: PREP_LIST_KEY });

      qc.setQueriesData<SubscriptionPrepRow[]>({ queryKey: PREP_LIST_KEY }, (old) => {
        if (!old) return old;
        return old.map((row) => {
          if (row.id !== id) return row;
          if (action === "prep") {
            return {
              ...row,
              prepStatus: "PREPARING" as const,
              packingStatus: "IN_PROGRESS" as const,
              status: "IN_KITCHEN",
            };
          }
          if (action === "pack") {
            return {
              ...row,
              prepStatus: "PACKED" as const,
              packingStatus: "PACKED" as const,
              dispatchStatus: "READY" as const,
              status: "PACKED",
            };
          }
          return {
            ...row,
            prepStatus: "READY" as const,
            dispatchStatus: "HANDED_OVER" as const,
            status: "OUT_FOR_DELIVERY",
          };
        });
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error("Could not update subscription delivery status.");
    },

    onSuccess: (_data, vars) => {
      const label =
        vars.action === "prep"
          ? "Started prep — print dispatch ticket"
          : vars.action === "pack"
            ? "Marked packed"
            : "Handed over for dispatch";
      toast.success(label);
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
      qc.invalidateQueries({ queryKey: DISPATCH_KEY });
    },
  });
}

/** Lightweight hook for combined kitchen load card on live orders tab. */
export function useTodaySubscriptionLoad(date: string) {
  return useQuery({
    queryKey: [...SUMMARY_KEY, date, "load-card"],
    queryFn: () => kitchenSubscriptionsApi.getKitchenSummary({ date }),
    staleTime: AUTO_REFRESH_MS,
    select: (data) => ({
      totalDeliveries: data.totalDeliveries,
      totalRotis: data.totalRotis,
      totalPacks: data.totalPacks,
    }),
  });
}

export type { SubscriptionKitchenQuery };
