"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  kitchenApi,
  type KitchenOperationsStatus,
  type UpdateKitchenOperationsPayload,
  type KitchenStatusValue,
} from "@/lib/api/kitchen.api";

export const KITCHEN_STATUS_QUERY_KEY = ["kitchen", "operations", "status"] as const;

export function useKitchenStatus() {
  return useQuery({
    queryKey: KITCHEN_STATUS_QUERY_KEY,
    queryFn: () => kitchenApi.getKitchenStatus(),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useUpdateKitchenStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateKitchenOperationsPayload) => kitchenApi.updateKitchenStatus(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: KITCHEN_STATUS_QUERY_KEY });
      const previous = queryClient.getQueryData<KitchenOperationsStatus>(KITCHEN_STATUS_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<KitchenOperationsStatus>(KITCHEN_STATUS_QUERY_KEY, {
          ...previous,
          status: payload.status,
        });
      }
      return { previous };
    },
    onSuccess: (data: KitchenOperationsStatus) => {
      queryClient.setQueryData(KITCHEN_STATUS_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: ["branch-dashboard", "stats"] });
      if (data.reopenAdjustedForGlobalHours) {
        toast.success("Kitchen closed. Reopen time adjusted to global order hours.");
      } else {
        toast.success("Kitchen status updated successfully");
      }
    },
    onError: (error: any, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(KITCHEN_STATUS_QUERY_KEY, context.previous);
      }
      const message =
        error?.response?.data?.message || error?.message || "Failed to update kitchen status";
      toast.error(message);
    },
  });
}

export type { KitchenStatusValue };
