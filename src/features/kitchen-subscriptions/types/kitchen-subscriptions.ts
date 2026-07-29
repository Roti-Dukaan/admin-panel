export type SubscriptionPrepStatus = "PENDING" | "PREPARING" | "PACKED" | "READY" | "DELIVERED" | "OTHER";
export type SubscriptionPackingStatus = "PENDING" | "IN_PROGRESS" | "PACKED";
export type SubscriptionDispatchStatus = "PENDING" | "READY" | "HANDED_OVER" | "DELIVERED";
export interface SubscriptionRotiItem {
  name: string;
  rotiType: string | null;
  quantity: number;
}

export interface SubscriptionKitchenSummary {
  date: string;
  branchId: string | null;
  totalDeliveries: number;
  totalPacks: number;
  totalRotis: number;
  totalCustomers: number;
  statusCounts: {
    pending: number;
    preparing: number;
    packed: number;
    readyForDispatch: number;
  };
  bySlot: Array<{
    slotId: string;
    slotName: string;
    deliveryCount: number;
    customerCount: number;
    packCount: number;
    rotiCount: number;
    rotiTypeTotals: Array<{ rotiType: string; quantity: number }>;
  }>;
  rotiTypeTotals: Array<{ rotiType: string; quantity: number }>;
}

export interface SubscriptionPrepRow {
  id: string;
  deliveryDate: string;
  source: "SUBSCRIPTION_DELIVERY";
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  deliverySlotId: string | null;
  deliverySlotName: string | null;
  deliverySlotStart: string | null;
  deliverySlotEnd: string | null;
  selectedRotis: SubscriptionRotiItem[];
  totalQuantity: number;
  notes: string | null;
  status: string;
  prepStatus: SubscriptionPrepStatus;
  packingStatus: SubscriptionPackingStatus;
  dispatchStatus: SubscriptionDispatchStatus;
  planName: string | null;
  subscriptionId: string;
}

export interface SubscriptionDispatchRow {
  id: string;
  source: "SUBSCRIPTION_DELIVERY";
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  deliverySlotName: string | null;
  selectedRotis: SubscriptionRotiItem[];
  totalQuantity: number;
  notes: string | null;
  status: string;
  dispatchStatus: "READY";
}

export const ROTI_TYPE_LABELS: Record<string, string> = {
  JOWAR: "Jowar",
  RAGI: "Ragi",
  WHEAT: "Wheat",
  MIXED: "Mixed",
  OTHERS: "Others",
};

export const PREP_STATUS_META: Record<
  SubscriptionPrepStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-blue-50 text-blue-700" },
  PREPARING: { label: "Preparing", className: "bg-amber-50 text-amber-700" },
  PACKED: { label: "Packed", className: "bg-emerald-50 text-emerald-700" },
  READY: { label: "Ready", className: "bg-indigo-50 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-emerald-50 text-emerald-700" },
  OTHER: { label: "Other", className: "bg-gray-50 text-gray-700" },};

export const PACKING_STATUS_META: Record<
  SubscriptionPackingStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-gray-50 text-gray-600" },
  IN_PROGRESS: { label: "In Progress", className: "bg-amber-50 text-amber-700" },
  PACKED: { label: "Packed", className: "bg-emerald-50 text-emerald-700" },
};

export const DISPATCH_STATUS_META: Record<
  SubscriptionDispatchStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-gray-50 text-gray-600" },
  READY: { label: "Ready", className: "bg-blue-50 text-blue-700" },
  HANDED_OVER: { label: "Handed Over", className: "bg-indigo-50 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-emerald-50 text-emerald-700" },
};