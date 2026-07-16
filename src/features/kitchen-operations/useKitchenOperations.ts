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
    onSuccess: (data: KitchenOperationsStatus) => {
      queryClient.setQueryData(KITCHEN_STATUS_QUERY_KEY, data);
      toast.success("Kitchen status updated successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || "Failed to update kitchen status";
      toast.error(message);
    },
  });
}

export type { KitchenStatusValue };
