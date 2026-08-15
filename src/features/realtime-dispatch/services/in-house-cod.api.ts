import { apiClient } from "@/lib/api/http";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export type CodCollectionStatus =
  | "PENDING"
  | "QR_CREATED"
  | "PAYMENT_PENDING"
  | "QR_PAID"
  | "CASH_COLLECTED"
  | "COLLECTED"
  | "MISMATCH"
  | "NOT_COLLECTED"
  | "FAILED";
export type CodHandoverStatus = "PENDING" | "SUBMITTED" | "RECEIVED" | "RECONCILED";
export type RiderWorkflowStatus =
  | "assigned"
  | "picked_up"
  | "arrived"
  | "cash_collection_pending"
  | "cash_collected"
  | "delivered"
  | "cash_handover_pending"
  | "cash_handed_to_manager"
  | "cash_reconciled"
  | "failed";

export type InHouseCodStop = {
  id: string;
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  paymentMethod: "COD" | "ONLINE";
  isCod: boolean;
  codExpectedAmount: number | null;
  codCollectedAmount: number | null;
  codCollectionStatus: CodCollectionStatus | null;
  codHandoverStatus: CodHandoverStatus | null;
  codAmount: number | null;
  codCollected: number | null;
  grandTotal: number;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { name: string; quantity: number }[];
  routeSequence: number | null;
  riderWorkflowStatus: RiderWorkflowStatus;
  dispatchStatus: string;
  googleMapsUrl: string | null;
  navigationTarget?: "branch" | "customer";
  branchName?: string | null;
  canMarkDelivered: boolean;
  canMarkFailed: boolean;
  requiresCodCollection: boolean;
  assigneeName?: string | null;
  codCollectionNote: string | null;
  codCollectionMethod?: "CASH" | "RAZORPAY_QR" | null;
  razorpayQrId?: string | null;
  qrImageUrl?: string | null;
  qrImageContent?: string | null;
  qrExpiresAt?: string | null;
  codPaymentVerifiedAt?: string | null;
};

export type CodRiderRollup = {
  id: string;
  name: string | null;
  email: string;
  expected: number;
  collected: number;
  pendingHandover: number;
  pendingCollectionCount: number;
  pendingCollectionAmount: number;
  awaitingReconcileAmount: number;
  reconciledAmount: number;
  deliveryCount: number;
};

export type CodHandoverFilter = "all" | "pending_collection" | "pending_handover" | "reconciled";

export type CodSummary = {
  date: string;
  branchId: string | null;
  totals: {
    expected: number;
    collected: number;
    pendingHandover: number;
    awaitingReconcile: number;
    reconciled: number;
    mismatches: number;
    pendingDelivery: number;
    orderCount: number;
    riderCount: number;
  };
  riders: CodRiderRollup[];
  pendingHandoverOrders: Array<{
    deliveryId: string;
    orderId: string;
    orderNumber: string;
    riderId: string | null;
    riderName: string | null;
    riderPhone: string | null;
    amount: number;
  }>;
};

export type CodRiderSummary = {
  rider: { id: string; name: string | null; email: string; phone: string | null };
  date: string;
  summary: { expected: number; collected: number; pendingHandover: number; deliveryCount: number };
  deliveries: InHouseCodStop[];
};

type CodApiParams = { date?: string; branchId?: string | null };

export const inHouseCodApi = {
  getSummary: (params?: CodApiParams): Promise<CodSummary> =>
    unwrap(
      apiClient.get("/manager/cod-summary", {
        params: { date: params?.date, branchId: params?.branchId ?? undefined },
      }),
    ),

  getRiderSummary: (riderId: string, params?: CodApiParams): Promise<CodRiderSummary> =>
    unwrap(
      apiClient.get(`/manager/cod-rider-summary/${riderId}`, {
        params: { date: params?.date, branchId: params?.branchId ?? undefined },
      }),
    ),

  recordHandover: (riderId: string, body: { receivedAmount: number; note?: string; date?: string }) =>
    unwrap(apiClient.patch(`/manager/cod-handover/${riderId}`, body)),

  reconcileHandover: (riderId: string, body?: { note?: string; date?: string }) =>
    unwrap(apiClient.patch(`/manager/cod-handover/${riderId}/reconcile`, body ?? {})),

  codOverride: (orderId: string, body: { collectedAmount: number; note?: string }) =>
    unwrap(apiClient.patch(`/manager/order/${orderId}/cod-override`, body)),

  getMismatchOrders: (params?: CodApiParams): Promise<InHouseCodStop[]> =>
    unwrap(
      apiClient.get("/manager/cod-mismatch-orders", {
        params: {
          date: params?.date,
          branchId: params?.branchId ?? undefined,
        },
      }),
    ),
};

export const inHouseRiderApi = {
  myDeliveries: (params?: { date?: string; tab?: string }): Promise<{
    stops: InHouseCodStop[];
    counts: {
      assigned: number;
      pending: number;
      completed: number;
      codPending: number;
      codCollected: number;
    };
  }> => unwrap(apiClient.get("/delivery-boy/realtime/my-deliveries", { params })),

  pickedUp: (deliveryId: string) =>
    unwrap(apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/picked-up`)),

  arrived: (deliveryId: string) =>
    unwrap(apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/arrived`)),

  confirmCod: (deliveryId: string, body: { collectedAmount: number; note?: string }) =>
    unwrap(apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/confirm-cod`, body)),

  delivered: (deliveryId: string, body?: { collectedAmount?: number; note?: string; remarks?: string }) =>
    unwrap(apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/delivered`, body ?? {})),

  failed: (deliveryId: string, body: { failureReason: string; remarks?: string }) =>
    unwrap(apiClient.patch(`/delivery-boy/realtime/delivery/${deliveryId}/failed`, body)),

  createCodQr: (orderId: string) =>
    unwrap(apiClient.post(`/delivery-boy/realtime/orders/${orderId}/cod/qr`)),

  getCodQrStatus: (orderId: string) =>
    unwrap(apiClient.get(`/delivery-boy/realtime/orders/${orderId}/cod/qr/status`)),

  closeCodQr: (orderId: string) =>
    unwrap(apiClient.post(`/delivery-boy/realtime/orders/${orderId}/cod/qr/close`)),

  confirmCodCash: (orderId: string, body: { collectedAmount: number; note?: string }) =>
    unwrap(apiClient.post(`/delivery-boy/realtime/orders/${orderId}/cod/cash`, body)),
};
