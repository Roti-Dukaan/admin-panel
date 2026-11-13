import type { KitchenOrderDetail, KitchenOrderListItem } from "@/lib/api/kitchen.api";
import type { BranchOrderNewPayload } from "@/lib/realtime/events";

/** Realtime / popup alerts are for quick and live prep-window orders only. */
export function isScheduledOrderAlert(payload: {
  deliveryType?: string | null;
}): boolean {
  return payload.deliveryType?.toUpperCase() === "SCHEDULED";
}

/** Kitchen list row is a future scheduled slot (no live prep alert yet). */
export function isScheduledKitchenQueueItem(item: KitchenOrderListItem): boolean {
  return Boolean(item.deliverySlot) || item.awaitingPrepWindow === true;
}

export function kitchenItemToAlertPayload(
  item: KitchenOrderListItem,
  branchId: string | null | undefined,
  detail?: KitchenOrderDetail,
): BranchOrderNewPayload {
  const itemsSummary =
    detail?.items?.map((line) => `${line.quantity}x ${line.foodNameSnapshot}`).join(", ") ||
    `${item.itemsCount} items`;

  return {
    orderId: item.orderId,
    orderNumber: item.orderNumber,
    status: "pending",
    occurredAt: item.orderCreatedAt,
    branchId: branchId ?? "",
    itemsSummary,
    itemCount: item.itemsCount,
    grandTotal: detail?.pricing?.grandTotal ?? 0,
    paymentMethod: detail?.payment?.paymentMethod,
    deliveryType: item.deliverySlot ? "SCHEDULED" : "QUICK",
  };
}
