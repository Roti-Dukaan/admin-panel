export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

export type DeliveryProvider =
  | "SHADOWFAX"
  | "SELF_DELIVERY"
  | "SHIPROCKET"
  | "PORTER";

export interface RiderInfo {
  name: string;
  phone: string;
  vehicleNumber?: string;
  currentLat?: number;
  currentLng?: number;
}

export interface DeliveryTimelineEntry {
  status: DeliveryStatus;
  timestamp: string;
  label: string;
  description?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: DeliveryProvider;
  providerShipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: DeliveryStatus;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  providerResponse?: Record<string, unknown>;
  webhookPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    customer: {
      id: string;
      fullName?: string;
      name?: string;
      phone?: string;
    };
    deliverySlot?: {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
    };
    estimatedPreparationTime?: number;
    createdAt: string;
    address?: {
      id: string;
      customerName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
}

export interface DeliveryListEntity {
  items: Delivery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DeliveryFilters {
  page?: number;
  limit?: number;
  status?: DeliveryStatus | "all";
  provider?: DeliveryProvider | "all";
  orderId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DeliveryStatistics {
  total: number;
  pending: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  failed: number;
  cancelled: number;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  providerShipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: DeliveryStatus;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  providerResponse?: Record<string, unknown>;
  webhookPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  order?: DeliveryOrder;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    name?: string;
    phone?: string;
  };
  deliverySlot?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  estimatedPreparationTime?: number;
  createdAt: string;
  items?: DeliveryOrderItem[];
  address?: DeliveryAddress;
  paymentMethod?: string;
  grandTotal?: number;
}

export interface DeliveryOrderItem {
  id: string;
  foodNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface DeliveryAddress {
  id: string;
  customerName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DeliveryListItem {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: DeliveryProvider;
  providerShipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: DeliveryStatus;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDeliveryResponse {
  items: DeliveryListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DeliveryStatusConfig = {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
};

export const DELIVERY_STATUS_CONFIG: Record<DeliveryStatus, DeliveryStatusConfig> = {
  PENDING: { label: "Pending", color: "orange", bgClass: "bg-orange-100", textClass: "text-orange-800", dotClass: "bg-orange-500" },
  ASSIGNED: { label: "Assigned", color: "blue", bgClass: "bg-blue-100", textClass: "text-blue-800", dotClass: "bg-blue-500" },
  PICKED_UP: { label: "Picked Up", color: "purple", bgClass: "bg-purple-100", textClass: "text-purple-800", dotClass: "bg-purple-500" },
  IN_TRANSIT: { label: "In Transit", color: "indigo", bgClass: "bg-indigo-100", textClass: "text-indigo-800", dotClass: "bg-indigo-500" },
  DELIVERED: { label: "Delivered", color: "green", bgClass: "bg-green-100", textClass: "text-green-800", dotClass: "bg-green-500" },
  FAILED: { label: "Failed", color: "red", bgClass: "bg-red-100", textClass: "text-red-800", dotClass: "bg-red-500" },
  CANCELLED: { label: "Cancelled", color: "gray", bgClass: "bg-gray-100", textClass: "text-gray-800", dotClass: "bg-gray-500" },
};

export const DELIVERY_PROVIDER_LABELS: Record<DeliveryProvider, string> = {
  SHADOWFAX: "Shadowfax",
  SELF_DELIVERY: "Self Delivery",
  SHIPROCKET: "Shiprocket",
  PORTER: "Porter",
};

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

export function canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  const fromIndex = DELIVERY_STATUS_ORDER.indexOf(from);
  const toIndex = DELIVERY_STATUS_ORDER.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) return false;
  return toIndex >= fromIndex || to === "CANCELLED" || to === "FAILED";
}