import { apiClient } from "@/lib/api/http";
import type {
  AssignableStaff,
  CreateDeliveryBoyInput,
  DeliveryBoy,
  DriverRouteResponse,
  UpdateDeliveryBoyInput,
  DriverDeliveryStop,
} from "../types/delivery-partners";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export type SubscriptionDeliveryApiScope = "branch" | "admin";

function subscriptionDeliveriesBasePath(scope: SubscriptionDeliveryApiScope): string {
  return scope === "admin" ? "/admin/subscription-deliveries" : "/branch-manager/subscription-deliveries";
}

export const deliveryBoysApi = {
  list: (params?: { branchId?: string; active?: boolean }): Promise<DeliveryBoy[]> =>
    unwrap(apiClient.get("/delivery-partners", { params })),

  getById: (id: string): Promise<DeliveryBoy> =>
    unwrap(apiClient.get(`/delivery-partners/${id}`)),

  create: (body: CreateDeliveryBoyInput): Promise<DeliveryBoy> =>
    unwrap(apiClient.post("/delivery-partners", body)),

  update: (id: string, body: UpdateDeliveryBoyInput): Promise<DeliveryBoy> =>
    unwrap(apiClient.patch(`/delivery-partners/${id}`, body)),

  listAssignable: (params?: { date?: string; slotId?: string }): Promise<AssignableStaff[]> =>
    unwrap(apiClient.get("/delivery-partners/assignable", { params })),

  listDispatchBoard: (
    date: string,
    slotId?: string,
    branchId?: string,
    scope: SubscriptionDeliveryApiScope = "branch",
  ): Promise<DriverDeliveryStop[]> =>
    unwrap(
      apiClient.get(`${subscriptionDeliveriesBasePath(scope)}/dispatch-board`, {
        params: { date, slotId, branchId },
      }),
    ),

  listAssignees: (date: string, slotId?: string): Promise<AssignableStaff[]> =>
    unwrap(
      apiClient.get("/branch-manager/subscription-deliveries/assignees", {
        params: { date, slotId },
      }),
    ),

  listUnassigned: (
    date: string,
    slotId?: string,
    branchId?: string,
    scope: SubscriptionDeliveryApiScope = "branch",
  ): Promise<DriverDeliveryStop[]> =>
    unwrap(
      apiClient.get(`${subscriptionDeliveriesBasePath(scope)}/unassigned`, {
        params: { date, slotId, branchId },
      }),
    ),

  listAssigned: (
    date: string,
    slotId?: string,
    branchId?: string,
    scope: SubscriptionDeliveryApiScope = "branch",
  ): Promise<DriverDeliveryStop[]> =>
    unwrap(
      apiClient.get(`${subscriptionDeliveriesBasePath(scope)}/assigned`, {
        params: { date, slotId, branchId },
      }),
    ),

  assign: (body: {
    deliveryIds: string[];
    assigneeUserId: string;
    date?: string;
    slotId?: string;
    assignmentNotes?: string;
    allowPartial?: boolean;
  }) => unwrap(apiClient.post("/branch-manager/subscription-deliveries/assign", body)),

  bulkAssign: (body: {
    deliveryIds: string[];
    assigneeUserId: string;
    date?: string;
    slotId?: string;
    assignmentNotes?: string;
    allowPartial?: boolean;
  }) => unwrap(apiClient.post("/branch-manager/subscription-deliveries/bulk-assign", body)),

  assignSelf: (body: {
    deliveryIds: string[];
    date?: string;
    slotId?: string;
    assignmentNotes?: string;
  }) => unwrap(apiClient.post("/branch-manager/subscription-deliveries/assign-self", body)),

  unassign: (body: { deliveryIds: string[]; date?: string; slotId?: string }) =>
    unwrap(apiClient.post("/branch-manager/subscription-deliveries/unassign", body)),

  assignOne: (deliveryId: string, assigneeUserId: string) =>
    unwrap(
      apiClient.post(`/branch-manager/subscription-deliveries/${deliveryId}/assign`, {
        assigneeUserId,
      }),
    ),

  assignOneSelf: (deliveryId: string) =>
    unwrap(apiClient.post(`/branch-manager/subscription-deliveries/${deliveryId}/assign-self`)),

  unassignOne: (deliveryId: string) =>
    unwrap(apiClient.post(`/branch-manager/subscription-deliveries/${deliveryId}/unassign`)),

  reassign: (deliveryId: string, assigneeUserId: string) =>
    unwrap(
      apiClient.patch(`/branch-manager/subscription-deliveries/${deliveryId}/reassign`, {
        assigneeUserId,
      }),
    ),
};

export const driverRouteApi = {
  myDeliveries: (date: string, tab?: string, slotId?: string): Promise<DriverRouteResponse> =>
    unwrap(
      apiClient.get("/delivery-partner/my-deliveries", {
        params: { date, tab, slotId },
      }),
    ),

  myRoute: (date: string, slotId?: string): Promise<DriverRouteResponse> =>
    unwrap(apiClient.get("/delivery-partner/my-route", { params: { date, slotId } })),

  updateStatus: (
    id: string,
    body: { status: "ARRIVED" | "DELIVERED" | "FAILED"; failureReason?: string; note?: string },
  ): Promise<DriverDeliveryStop> =>
    unwrap(apiClient.patch(`/delivery-partner/delivery/${id}/status`, body)),

  updateNote: (id: string, note: string): Promise<DriverDeliveryStop> =>
    unwrap(apiClient.patch(`/delivery-partner/delivery/${id}/note`, { note })),

  navigation: (id: string): Promise<{ deliveryId: string; url: string; address: string }> =>
    unwrap(apiClient.get(`/delivery-partner/delivery/${id}/navigation`)),
};
