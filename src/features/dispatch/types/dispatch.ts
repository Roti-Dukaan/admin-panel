export type DispatchBatchStatusType =
  | "PENDING"
  | "READY"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

export const DISPATCH_STATUS_META: Record<
  DispatchBatchStatusType,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Pending", color: "text-gray-600", bg: "bg-gray-100" },
  READY: { label: "Ready", color: "text-blue-600", bg: "bg-blue-100" },
  ASSIGNED: { label: "Assigned", color: "text-violet-600", bg: "bg-violet-100" },
  PICKED_UP: { label: "Picked Up", color: "text-amber-600", bg: "bg-amber-100" },
  IN_TRANSIT: { label: "In Transit", color: "text-indigo-600", bg: "bg-indigo-100" },
  COMPLETED: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100" },
};

export interface DispatchBatchListItem {
  id: string;
  batchNumber: string;
  deliveryZone: string | null;
  provider: string | null;
  status: DispatchBatchStatusType;
  totalOrders: number;
  driverCount: number;
  estimatedPickupTime: string | null;
  estimatedDeliveryWindow: string | null;
  createdAt: string;
}

export interface DispatchBatchDetail extends DispatchBatchListItem {
  orders: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    address: string | null;
    deliverySlotName: string | null;
    grandTotal: number;
    status: string;
    deliveryStatus: string | null;
    providerShipmentId: string | null;
    trackingUrl: string | null;
    riderName: string | null;
    riderPhone: string | null;
  }>;
}

export interface DispatchDashboard {
  pendingDispatch: number;
  assigned: number;
  pickedUp: number;
  completed: number;
  failed: number;
  todayDispatches: number;
  todayRiders: number;
  todayBatches: number;
}

export interface DispatchBatchListResponse {
  items: DispatchBatchListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
