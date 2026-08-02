import type {
  KitchenStage,
  KitchenPriority,
  KitchenOrderListItem,
  KitchenOrderDetail,
  KitchenPrepTimer,
  KitchenDeliverySlot,
} from "@/lib/api/kitchen.api";
import { formatDeliverySlotLabel } from "@/lib/delivery-slot-display";

/** Public 3-stage kitchen workflow used by the dashboard. */
export const STAGES: KitchenStage[] = ["PENDING", "PREPARING", "READY_FOR_PICKUP"];

export const STAGE_META: Record<
  KitchenStage,
  { label: string; shortLabel: string; emoji: string; accent: string; columnClass: string; dotClass: string; pillClass: string }
> = {
  PENDING: {
    label: "New Orders",
    shortLabel: "Pending",
    emoji: "🆕",
    accent: "text-blue-700",
    columnClass: "bg-blue-50/60",
    dotClass: "bg-blue-400",
    pillClass: "bg-blue-50 text-blue-700",
  },
  PREPARING: {
    label: "Preparing",
    shortLabel: "Preparing",
    emoji: "👨‍🍳",
    accent: "text-amber-700",
    columnClass: "bg-amber-50/60",
    dotClass: "bg-amber-400",
    pillClass: "bg-amber-50 text-amber-700",
  },
  READY_FOR_PICKUP: {
    label: "Ready For Pickup",
    shortLabel: "Ready",
    emoji: "✅",
    accent: "text-emerald-700",
    columnClass: "bg-emerald-50/60",
    dotClass: "bg-emerald-400",
    pillClass: "bg-emerald-50 text-emerald-700",
  },
};

/** Map backend priority to the previous design's priority badge. */
export const PRIORITY_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string }
> = {
  NORMAL: { label: "Normal", bgClass: "bg-gray-100", textClass: "text-gray-600" },
  HIGH: { label: "VIP", bgClass: "bg-violet-100", textClass: "text-violet-700" },
  URGENT: { label: "Express", bgClass: "bg-red-100", textClass: "text-red-700" },
};

export function priorityBadge(priority?: string) {
  return PRIORITY_CONFIG[priority ?? "NORMAL"] ?? PRIORITY_CONFIG.NORMAL;
}

export const DELIVERY_KIND = {
  QUICK: "quick",
  SCHEDULED: "scheduled",
} as const;

export type DeliveryKind = (typeof DELIVERY_KIND)[keyof typeof DELIVERY_KIND];

export const PAYMENT_FILTER = {
  ALL: "all",
  PAID: "paid",
  COD: "cod",
} as const;

export type PaymentFilter = (typeof PAYMENT_FILTER)[keyof typeof PAYMENT_FILTER];

export const PREP_TIME_FILTER = {
  OLDEST: "oldest",
  NEWEST: "newest",
} as const;

export type PrepTimeFilter = (typeof PREP_TIME_FILTER)[keyof typeof PREP_TIME_FILTER];

/** A kitchen order as shown on the board (list item + lazily-resolved payment). */
export interface KitchenOrderView extends KitchenOrderListItem {
  paymentMethod?: string | null;
  paymentStatus?: string | null;
}

export type { KitchenStage, KitchenPriority, KitchenOrderListItem, KitchenOrderDetail, KitchenPrepTimer, KitchenDeliverySlot };

/** Derive quick vs scheduled from the presence of a delivery slot. */
export function getDeliveryKind(order: KitchenOrderListItem | KitchenOrderView): DeliveryKind {
  return order.deliverySlot ? DELIVERY_KIND.SCHEDULED : DELIVERY_KIND.QUICK;
}

/** Format a delivery slot window, e.g. "7:00 AM – 7:30 AM". */
export function formatSlotWindow(slot?: KitchenDeliverySlot | null): string | null {
  if (!slot) return null;
  return formatDeliverySlotLabel(slot.startTime, slot.endTime);
}
