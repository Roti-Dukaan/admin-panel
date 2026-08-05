import type { DeliveryKind, KitchenOrderView } from "../types/kitchen";

/** Scheduled orders appear on the kitchen board this many minutes before slot start. */
export const KITCHEN_SCHEDULED_LEAD_MINUTES = 30;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function startOfDayIst(date: Date): Date {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();
  return new Date(Date.UTC(y, m, d) - IST_OFFSET_MS);
}

function combineIstDateAndTime(referenceDate: Date, timeHhMm: string): Date {
  const [hours, minutes] = timeHhMm.split(":").map(Number);
  const dayStart = startOfDayIst(referenceDate);
  return new Date(dayStart.getTime() + hours * 3_600_000 + minutes * 60_000);
}

function getScheduledKitchenVisibleAt(orderCreatedAt: Date, slotStartTime: string): Date {
  const slotStart = combineIstDateAndTime(orderCreatedAt, slotStartTime);
  return new Date(slotStart.getTime() - KITCHEN_SCHEDULED_LEAD_MINUTES * 60_000);
}

/** Whether a scheduled order should appear on the live kitchen board. */
export function isKitchenBoardVisible(order: KitchenOrderView, now: Date = new Date()): boolean {
  if (!order.deliverySlot?.startTime) return true;
  if (order.kitchenStatus !== "PENDING") return true;

  const orderCreatedAt = new Date(order.orderCreatedAt);
  return now.getTime() >= getScheduledKitchenVisibleAt(orderCreatedAt, order.deliverySlot.startTime).getTime();
}

export function isScheduledBranchOrder(payload: { deliveryType?: string | null }): boolean {
  return payload.deliveryType?.toUpperCase() === "SCHEDULED";
}

export function isScheduledDeliveryKind(kind: DeliveryKind): boolean {
  return kind === "scheduled";
}
