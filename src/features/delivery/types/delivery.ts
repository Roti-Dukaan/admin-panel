export type DeliveryStatus =
  | "WAITING_FOR_KITCHEN"
  | "WAITING_FOR_PROVIDER"
  | "PROVIDER_ASSIGNMENT_FAILED"
  | "PROVIDER_ASSIGNED"
  | "RIDER_ARRIVING"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

export type DeliveryType = "QUICK" | "SCHEDULED";

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
  deliveryType: DeliveryType;
  provider: DeliveryProvider;
  providerShipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: DeliveryStatus;
  deliveryFee?: number;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  riderTrackingUrl?: string | null;
  providerStatus?: string | null;
  providerAttempts?: number;
  assignmentFailedReason?: string | null;
  correlationId?: string | null;
  lastAttemptAt?: string | null;
  providerAssignedAt?: string | null;
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
  deliveryType?: DeliveryType | "all";
  orderId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DeliveryStatistics {
  total: number;
  waitingForKitchen: number;
  waitingForProvider: number;
  providerAssigned: number;
  riderArriving: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
  cancelled: number;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveryType?: DeliveryType;
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
  riderTrackingUrl?: string | null;
  providerStatus?: string | null;
  providerAttempts?: number;
  assignmentFailedReason?: string | null;
  correlationId?: string | null;
  lastAttemptAt?: string | null;
  providerAssignedAt?: string | null;
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
  deliveryType?: DeliveryType;
  deliveryFee?: number;
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  riderTrackingUrl?: string | null;
  providerStatus?: string | null;
  providerAttempts?: number;
  assignmentFailedReason?: string | null;
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
  WAITING_FOR_KITCHEN: { label: "Waiting for Kitchen", color: "amber", bgClass: "bg-amber-100", textClass: "text-amber-800", dotClass: "bg-amber-500" },
  WAITING_FOR_PROVIDER: { label: "Waiting for Provider", color: "orange", bgClass: "bg-orange-100", textClass: "text-orange-800", dotClass: "bg-orange-500" },
  PROVIDER_ASSIGNMENT_FAILED: { label: "Assignment Failed", color: "rose", bgClass: "bg-rose-100", textClass: "text-rose-800", dotClass: "bg-rose-500" },
  PROVIDER_ASSIGNED: { label: "Provider Assigned", color: "blue", bgClass: "bg-blue-100", textClass: "text-blue-800", dotClass: "bg-blue-500" },
  RIDER_ARRIVING: { label: "Rider Arriving", color: "cyan", bgClass: "bg-cyan-100", textClass: "text-cyan-800", dotClass: "bg-cyan-500" },
  PICKED_UP: { label: "Picked Up", color: "purple", bgClass: "bg-purple-100", textClass: "text-purple-800", dotClass: "bg-purple-500" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "indigo", bgClass: "bg-indigo-100", textClass: "text-indigo-800", dotClass: "bg-indigo-500" },
  DELIVERED: { label: "Delivered", color: "green", bgClass: "bg-emerald-100", textClass: "text-emerald-800", dotClass: "bg-emerald-500" },
  FAILED: { label: "Failed", color: "red", bgClass: "bg-red-100", textClass: "text-red-800", dotClass: "bg-red-500" },
  CANCELLED: { label: "Cancelled", color: "gray", bgClass: "bg-gray-100", textClass: "text-gray-800", dotClass: "bg-gray-500" },
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  QUICK: "Quick",
  SCHEDULED: "Scheduled",
};

export const DELIVERY_PROVIDER_LABELS: Record<DeliveryProvider, string> = {
  SHADOWFAX: "Shadowfax",
  SELF_DELIVERY: "Self Delivery",
  SHIPROCKET: "Shiprocket",
  PORTER: "Porter",
};

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
  "WAITING_FOR_KITCHEN",
  "WAITING_FOR_PROVIDER",
  "PROVIDER_ASSIGNMENT_FAILED",
  "PROVIDER_ASSIGNED",
  "RIDER_ARRIVING",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const DELIVERY_ALLOWED_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  WAITING_FOR_KITCHEN: ["WAITING_FOR_PROVIDER", "CANCELLED"],
  WAITING_FOR_PROVIDER: ["PROVIDER_ASSIGNED", "PROVIDER_ASSIGNMENT_FAILED", "CANCELLED"],
  PROVIDER_ASSIGNMENT_FAILED: ["WAITING_FOR_PROVIDER", "CANCELLED"],
  PROVIDER_ASSIGNED: ["RIDER_ARRIVING", "PICKED_UP", "CANCELLED"],
  RIDER_ARRIVING: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["OUT_FOR_DELIVERY", "FAILED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED", "CANCELLED"],
  DELIVERED: [],
  FAILED: ["WAITING_FOR_PROVIDER"],
  CANCELLED: [],
};

export function canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}