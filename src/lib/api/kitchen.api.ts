import { apiClient } from "./http";

export type KitchenStage = "PENDING" | "PREPARING" | "READY_FOR_PICKUP";

export type KitchenPriority = "NORMAL" | "HIGH" | "URGENT";

export type KitchenStatusValue = "OPEN" | "BUSY" | "CLOSED" | "MAINTENANCE";

export interface KitchenOperationsStatus {
  status: KitchenStatusValue;
  busyDelayMinutes: number;
  message: string | null;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface UpdateKitchenOperationsPayload {
  status: KitchenStatusValue;
  busyDelayMinutes?: number;
  message?: string;
}

export interface KitchenPrepTimer {
  estimatedPreparationMinutes?: number;
  elapsedMinutes: number;
  preparingMinutes: number | null;
  readyDurationMinutes: number | null;
  isReady: boolean;
}

export interface KitchenDeliverySlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface KitchenOrderListItem {
  ticketId: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  kitchenStatus: KitchenStage;
  stageLabel: string;
  priority: KitchenPriority;
  customer: {
    id: string;
    name: string;
    phone: string;
  } | null;
  itemsCount: number;
  totalQuantity: number;
  deliveryType: string;
  deliverySlot?: KitchenDeliverySlot | null;
  startedPreparingAt?: string;
  readyAt?: string;
  orderCreatedAt: string;
  timer: KitchenPrepTimer;
}

export interface KitchenOrderListResponse {
  items: KitchenOrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KitchenTaxLine {
  foodNameSnapshot: string;
  hsnCode?: string;
  gstPercentage: number;
  gstType: string;
  lineGSTAmount: number;
}

export interface KitchenOrderDetail {
  ticketId: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  kitchenStatus: KitchenStage;
  stageLabel: string;
  priority: KitchenPriority;
  deliveryType: string;
  specialInstructions?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  } | null;
  items: Array<{
    id: string;
    foodNameSnapshot: string;
    categorySnapshot?: string;
    quantity: number;
    finalUnitPrice: number;
    lineTotal: number;
  }>;
  address: {
    customerName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  pricing: {
    currency: string;
    subtotalBaseAmount: number;
    subtotalGSTAmount: number;
    subtotalAmount: number;
    deliveryCharge: number;
    deliveryGSTAmount: number;
    discountAmount: number;
    roundOffAmount: number;
    grandTotal: number;
  };
  taxes: {
    totalGSTAmount: number;
    lines: KitchenTaxLine[];
  };
  payment: {
    id: string;
    paymentReference?: string;
    paymentMethod: string;
    status?: string;
    amount?: number;
  } | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    pdfUrl?: string;
  } | null;
  deliverySlot?: KitchenDeliverySlot | null;
  delivery?: {
    id: string;
    status: string;
    provider?: string | null;
    providerShipmentId?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    riderName?: string;
    riderPhone?: string;
    vehicleNumber?: string;
    pickupOtp?: string;
    estimatedPickupAt?: string;
    estimatedDeliveryAt?: string;
    riderArrivedAt?: string;
    actualPickupAt?: string;
    actualDeliveryAt?: string;
    providerStatus?: string | null;
  } | null;
  startedPreparingAt?: string;
  readyAt?: string;
  orderCreatedAt: string;
  timer: KitchenPrepTimer;
  timeline: Array<{
    id: string;
    status: string;
    remarks?: string;
    createdByType: string;
    createdById: string;
    createdAt: string;
  }>;
}

export interface KitchenOrderQuery {
  page?: number;
  limit?: number;
  status?: KitchenStage;
  search?: string;
  sortBy?: "createdAt" | "status" | "startedAt" | "readyAt";
  sortOrder?: "asc" | "desc";
}

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export const kitchenApi = {
  /** GET /admin/kitchen/orders — kitchen queue with filters, search, pagination & sorting. */
  listOrders: (query: KitchenOrderQuery = {}): Promise<KitchenOrderListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.status) params.append("status", query.status);
    if (query.search) params.append("search", query.search);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);
    return unwrap(apiClient.get(`/admin/kitchen/orders?${params.toString()}`));
  },

  /** GET /admin/kitchen/orders/:id — full kitchen order detail. */
  getOrderDetail: (id: string): Promise<KitchenOrderDetail> =>
    unwrap(apiClient.get(`/admin/kitchen/orders/${id}`)),

  /** PATCH /admin/kitchen/orders/:id/preparing — PENDING → PREPARING. */
  markPreparing: (id: string): Promise<KitchenOrderDetail> =>
    unwrap(apiClient.patch(`/admin/kitchen/orders/${id}/preparing`)),

  /** PATCH /admin/kitchen/orders/:id/ready — PREPARING → READY_FOR_PICKUP. */
  markReady: (id: string): Promise<KitchenOrderDetail> =>
    unwrap(apiClient.patch(`/admin/kitchen/orders/${id}/ready`)),

  /** GET /admin/kitchen/status — current kitchen operational status. */
  getKitchenStatus: (): Promise<KitchenOperationsStatus> =>
    unwrap(apiClient.get(`/admin/kitchen/status`)),

  /** PATCH /admin/kitchen/status — update the kitchen operational status. */
  updateKitchenStatus: (payload: UpdateKitchenOperationsPayload): Promise<KitchenOperationsStatus> =>
    unwrap(apiClient.patch(`/admin/kitchen/status`, payload)),
};
