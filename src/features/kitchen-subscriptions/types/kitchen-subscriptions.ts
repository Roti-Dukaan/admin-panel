export type SubscriptionKitchenStage = "PREPARING" | "READY" | "READY_FOR_DISPATCH" | "ASSIGNED" | "PICKED_UP";

export const SUBSCRIPTION_STAGES: SubscriptionKitchenStage[] = [
  "PREPARING",
  "READY",
  "READY_FOR_DISPATCH",
];

export const SUBSCRIPTION_STAGE_META: Record<
  SubscriptionKitchenStage,
  { label: string; shortLabel: string; emoji: string; accent: string; columnClass: string; dotClass: string; pillClass: string }
> = {
  PREPARING: {
    label: "Preparing",
    shortLabel: "Preparing",
    emoji: "👨‍🍳",
    accent: "text-amber-700",
    columnClass: "bg-amber-50/60",
    dotClass: "bg-amber-400",
    pillClass: "bg-amber-50 text-amber-700",
  },
  READY: {
    label: "Ready",
    shortLabel: "Ready",
    emoji: "✅",
    accent: "text-emerald-700",
    columnClass: "bg-emerald-50/60",
    dotClass: "bg-emerald-400",
    pillClass: "bg-emerald-50 text-emerald-700",
  },
  READY_FOR_DISPATCH: {
    label: "Ready For Dispatch",
    shortLabel: "Dispatch",
    emoji: "📦",
    accent: "text-blue-700",
    columnClass: "bg-blue-50/60",
    dotClass: "bg-blue-400",
    pillClass: "bg-blue-50 text-blue-700",
  },
};

export interface SubscriptionOrderListItem {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  mealSlot: string;
  subscriptionId: string;
  subscriptionNumber: string;
  stage: SubscriptionKitchenStage;
  itemsCount: number;
  totalQuantity: number;
  grandTotal: number;
  deliverySlotName: string | null;
  deliverySlotStart: string | null;
  deliverySlotEnd: string | null;
  deliveryZone: string | null;
  createdAt: string;
  startedPreparingAt: string | null;
  readyAt: string | null;
  readyForDispatchAt: string | null;
}

export interface SubscriptionOrderDetail extends SubscriptionOrderListItem {
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
    grandTotal: number;
  };
  specialInstructions?: string;
  timeline: Array<{
    id: string;
    status: string;
    remarks?: string;
    createdByType: string;
    createdById: string;
    createdAt: string;
  }>;
}

export interface SubscriptionProductionSummary {
  breakfast: { totalOrders: number; vegMeals: number; nonVegMeals: number; totalRotis: number };
  lunch: { totalOrders: number; vegMeals: number; nonVegMeals: number; totalRotis: number };
  dinner: { totalOrders: number; vegMeals: number; nonVegMeals: number; totalRotis: number };
  totalOrders: number;
  totalVegMeals: number;
  totalNonVegMeals: number;
  totalRotis: number;
}

export interface SubscriptionOrderListResponse {
  items: SubscriptionOrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type MealSlot = "breakfast" | "lunch" | "dinner" | "all";
