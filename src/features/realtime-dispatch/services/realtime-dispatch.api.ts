import { apiClient } from "@/lib/api/http";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export type RealtimeDispatchMethod = "PENDING" | "BORZO" | "IN_HOUSE" | "SELF";

export type RealtimeDispatchItem = {
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  deliveryStatus: string;
  dispatchMethod: RealtimeDispatchMethod | null;
  provider: string | null;
  paymentMethod: "COD" | "ONLINE";
  isCod?: boolean;
  codExpectedAmount?: number | null;
  codCollectedAmount?: number | null;
  codCollectionStatus?: string | null;
  codHandoverStatus?: string | null;
  codAmount: number | null;
  codCollected: number | null;
  settlementStatus: string | null;
  grandTotal: number;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { name: string; quantity: number }[];
  assignedToUserId: string | null;
  assigneeName: string | null;
  riderName: string | null;
  riderPhone: string | null;
  trackingUrl: string | null;
  routeSequence: number | null;
  createdAt: string;
  canDispatch: boolean;
  canChangeProvider: boolean;
};

export type RealtimeDispatchBoard = {
  pending: RealtimeDispatchItem[];
  active: RealtimeDispatchItem[];
  total: number;
};

export type AssignableStaff = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  activeLoad: number;
};

export const realtimeDispatchApi = {
  getBoard: (): Promise<RealtimeDispatchBoard> =>
    unwrap(apiClient.get("/branch-manager/realtime-dispatch/board")),

  getDetails: (deliveryId: string): Promise<RealtimeDispatchItem> =>
    unwrap(apiClient.get(`/branch-manager/realtime-dispatch/${deliveryId}`)),

  getAssignees: (): Promise<AssignableStaff[]> =>
    unwrap(apiClient.get("/branch-manager/realtime-dispatch/assignees")),

  dispatchBorzo: (deliveryId: string): Promise<RealtimeDispatchItem> =>
    unwrap(apiClient.post(`/branch-manager/realtime-dispatch/${deliveryId}/dispatch/borzo`)),

  dispatchInHouse: (
    deliveryId: string,
    body: { assigneeUserId: string; notes?: string },
  ): Promise<RealtimeDispatchItem> =>
    unwrap(apiClient.post(`/branch-manager/realtime-dispatch/${deliveryId}/dispatch/in-house`, body)),

  assignSelf: (deliveryId: string, notes?: string): Promise<RealtimeDispatchItem> =>
    unwrap(apiClient.post(`/branch-manager/realtime-dispatch/${deliveryId}/assign-self`, { notes })),

  changeProvider: (
    deliveryId: string,
    body: { dispatchMethod: RealtimeDispatchMethod; assigneeUserId?: string; notes?: string },
  ): Promise<RealtimeDispatchItem> =>
    unwrap(apiClient.post(`/branch-manager/realtime-dispatch/${deliveryId}/change-provider`, body)),

  updateCodStatus: (
    deliveryId: string,
    body: { collectedAmount: number; remarks?: string },
  ): Promise<RealtimeDispatchItem> =>
    unwrap(apiClient.patch(`/branch-manager/realtime-dispatch/${deliveryId}/cod-status`, body)),
};

export const realtimeDriverApi = {
  myDeliveries: (tab?: string): Promise<{
    stops: Array<RealtimeDispatchItem & { id: string; googleMapsUrl: string | null; dispatchStatus: string }>;
    counts: { assigned: number; pending: number; completed: number };
  }> => unwrap(apiClient.get("/delivery-boy/realtime/my-deliveries", { params: { tab } })),

  updateStatus: (
    deliveryId: string,
    body: { status: "RIDER_ARRIVED" | "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED"; failureReason?: string },
  ) => unwrap(apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/status`, body)),

  collectCod: (deliveryId: string, collectedAmount: number) =>
    unwrap(
      apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/cod-collected`, {
        collectedAmount,
      }),
    ),
};
