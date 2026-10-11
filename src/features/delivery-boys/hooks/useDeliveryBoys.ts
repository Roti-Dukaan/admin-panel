import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryBoysApi, driverRouteApi } from "../services/delivery-boys.api";

export const DELIVERY_BOYS_KEY = ["delivery-partners"] as const;
export const DRIVER_ROUTE_KEY = ["driver-route"] as const;

export function useDeliveryBoys(activeOnly?: boolean) {
  return useQuery({
    queryKey: [...DELIVERY_BOYS_KEY, { activeOnly }],
    queryFn: () => deliveryBoysApi.list(activeOnly === undefined ? undefined : { active: activeOnly }),
  });
}

export function useAssignableStaff(date?: string, slotId?: string) {
  return useQuery({
    queryKey: [...DELIVERY_BOYS_KEY, "assignable", date, slotId],
    queryFn: () =>
      date
        ? deliveryBoysApi.listAssignees(date, slotId)
        : deliveryBoysApi.listAssignable({ date, slotId }),
  });
}

export function useDispatchBoard(date: string, slotId?: string) {
  return useQuery({
    queryKey: [...DELIVERY_BOYS_KEY, "dispatch-board", date, slotId],
    queryFn: () => deliveryBoysApi.listDispatchBoard(date, slotId),
    refetchInterval: 30_000,
  });
}

export function useDeliveryBoyMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: DELIVERY_BOYS_KEY });

  const create = useMutation({
    mutationFn: deliveryBoysApi.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof deliveryBoysApi.update>[1]) =>
      deliveryBoysApi.update(id, body),
    onSuccess: invalidate,
  });

  return { create, update };
}

export function useSubscriptionAssignment(date: string, slotId?: string) {
  const dispatchBoard = useDispatchBoard(date, slotId);

  const unassigned = useQuery({
    queryKey: [...DELIVERY_BOYS_KEY, "unassigned", date, slotId],
    queryFn: () => deliveryBoysApi.listUnassigned(date, slotId),
  });

  const assigned = useQuery({
    queryKey: [...DELIVERY_BOYS_KEY, "assigned", date, slotId],
    queryFn: () => deliveryBoysApi.listAssigned(date, slotId),
  });

  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: DELIVERY_BOYS_KEY });
    queryClient.invalidateQueries({ queryKey: DRIVER_ROUTE_KEY });
  };

  const assign = useMutation({
    mutationFn: deliveryBoysApi.assign,
    onSuccess: invalidate,
  });

  const bulkAssign = useMutation({
    mutationFn: deliveryBoysApi.bulkAssign,
    onSuccess: invalidate,
  });

  const assignSelf = useMutation({
    mutationFn: deliveryBoysApi.assignSelf,
    onSuccess: invalidate,
  });

  const unassign = useMutation({
    mutationFn: deliveryBoysApi.unassign,
    onSuccess: invalidate,
  });

  const assignOne = useMutation({
    mutationFn: ({ deliveryId, assigneeUserId }: { deliveryId: string; assigneeUserId: string }) =>
      deliveryBoysApi.assignOne(deliveryId, assigneeUserId),
    onSuccess: invalidate,
  });

  const assignOneSelf = useMutation({
    mutationFn: (deliveryId: string) => deliveryBoysApi.assignOneSelf(deliveryId),
    onSuccess: invalidate,
  });

  const unassignOne = useMutation({
    mutationFn: (deliveryId: string) => deliveryBoysApi.unassignOne(deliveryId),
    onSuccess: invalidate,
  });

  const reassign = useMutation({
    mutationFn: ({ deliveryId, assigneeUserId }: { deliveryId: string; assigneeUserId: string }) =>
      deliveryBoysApi.reassign(deliveryId, assigneeUserId),
    onSuccess: invalidate,
  });

  return {
    dispatchBoard,
    unassigned,
    assigned,
    assign,
    bulkAssign,
    assignSelf,
    unassign,
    assignOne,
    assignOneSelf,
    unassignOne,
    reassign,
  };
}

export function useDriverRoute(date: string, tab?: string) {
  return useQuery({
    queryKey: [...DRIVER_ROUTE_KEY, date, tab],
    queryFn: () => driverRouteApi.myDeliveries(date, tab),
    refetchInterval: 30_000,
  });
}

export function useDriverMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: DRIVER_ROUTE_KEY });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      status: "ARRIVED" | "DELIVERED" | "FAILED";
      failureReason?: string;
      note?: string;
    }) => driverRouteApi.updateStatus(id, body),
    onSuccess: invalidate,
  });

  return { updateStatus };
}
