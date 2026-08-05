import type { KitchenOrderDetail, KitchenOrderListItem } from "@/lib/api/kitchen.api";
import type { BranchOrderNewPayload } from "@/lib/realtime/events";

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
    deliveryType: item.deliveryType,
  };
}
