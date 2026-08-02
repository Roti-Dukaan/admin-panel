import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  driverSubscriptionRouteApi,
  subscriptionDispatchApi,
} from "../services/subscription-dispatch.api";
import { DELIVERY_BOYS_KEY, DRIVER_ROUTE_KEY } from "@/features/delivery-boys/hooks/useDeliveryBoys";

export const SUBSCRIPTION_DISPATCH_KEY = ["subscription-dispatch"] as const;

export function useRouteBatches(date: string, slotId?: string, driverId?: string) {
  return useQuery({
    queryKey: [...SUBSCRIPTION_DISPATCH_KEY, "batches", date, slotId, driverId],
    queryFn: () =>
      subscriptionDispatchApi.listRouteBatches({
        date,
        slotId,
        driverId,
      }),
    refetchInterval: 30_000,
  });
}

export function useRouteBatch(batchId: string | null) {
  return useQuery({
    queryKey: [...SUBSCRIPTION_DISPATCH_KEY, "batch", batchId],
    queryFn: () => subscriptionDispatchApi.getRouteBatch(batchId!),
    enabled: !!batchId,
  });
}

export function useSubscriptionDispatchMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_DISPATCH_KEY });
    queryClient.invalidateQueries({ queryKey: DELIVERY_BOYS_KEY });
    queryClient.invalidateQueries({ queryKey: DRIVER_ROUTE_KEY });
  };

  const bulkAssign = useMutation({
    mutationFn: subscriptionDispatchApi.bulkAssign,
    onSuccess: invalidate,
  });

  const assignSelf = useMutation({
    mutationFn: subscriptionDispatchApi.assignSelf,
    onSuccess: invalidate,
  });

  const optimizeBatch = useMutation({
    mutationFn: subscriptionDispatchApi.optimizeRouteBatch,
    onSuccess: invalidate,
  });

  const reorderBatch = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      stops: Array<{ deliveryId: string; sequence: number }>;
      optimizationStatus?: "MANUAL_OVERRIDE";
    }) => subscriptionDispatchApi.reorderRouteBatch(id, body),
    onSuccess: invalidate,
  });

  const splitBatch = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      deliveryIds: string[];
      newDriverUserId?: string;
    }) => subscriptionDispatchApi.splitRouteBatch(id, body),
    onSuccess: invalidate,
  });

  return { bulkAssign, assignSelf, optimizeBatch, reorderBatch, splitBatch };
}

export function useDriverSubscriptionRoutes(date: string, slot?: string) {
  return useQuery({
    queryKey: [...SUBSCRIPTION_DISPATCH_KEY, "driver-routes", date, slot],
    queryFn: () => driverSubscriptionRouteApi.listRoutes(date, slot),
    refetchInterval: 30_000,
  });
}

export function useDriverSubscriptionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_DISPATCH_KEY });
    queryClient.invalidateQueries({ queryKey: DRIVER_ROUTE_KEY });
  };

  const updateStopStatus = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      status: string;
      failureReason?: string;
      note?: string;
    }) => driverSubscriptionRouteApi.updateStopStatus(id, body),
    onSuccess: invalidate,
  });

  return { updateStopStatus };
}
