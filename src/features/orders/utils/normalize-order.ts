import type { Order, OrderItem } from "../types/order";
import { normalizeOrderStatus } from "./status";

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeOrderItem(item: Record<string, unknown>): OrderItem {
  const quantity = toNumber(item.quantity, 1) || 1;
  const unitPrice = toNumber(
    item.unitPrice ?? item.finalUnitPrice ?? item.baseUnitPrice,
  );
  const total = toNumber(item.total ?? item.lineTotal, unitPrice * quantity);
  const foodName = String(
    item.foodName ?? item.foodNameSnapshot ?? item.name ?? "Unknown item",
  );
  const foodImage = (item.foodImage ?? item.foodImageSnapshot) as
    | string
    | undefined;

  return {
    id: String(item.id ?? ""),
    foodName,
    foodImage,
    quantity,
    unitPrice,
    total,
  };
}

export function normalizeOrder(order: Record<string, unknown>): Order {
  const timeline = Array.isArray(order.timeline)
    ? order.timeline.map((entry) => {
        const e = entry as Record<string, unknown>;
        return {
          ...e,
          status: normalizeOrderStatus(String(e.status ?? "")),
        };
      })
    : [];

  const items = Array.isArray(order.items)
    ? order.items.map((item) =>
        normalizeOrderItem(item as Record<string, unknown>),
      )
    : [];

  const statusChangedByRole = order.statusChangedByRole;
  const normalizedRole =
    statusChangedByRole === "admin" ||
    statusChangedByRole === "branch_manager" ||
    statusChangedByRole === "delivery_partner" ||
    statusChangedByRole === "customer" ||
    statusChangedByRole === "system"
      ? statusChangedByRole
      : undefined;

  return {
    ...(order as Order),
    status: normalizeOrderStatus(String(order.status ?? "")),
    timeline,
    items,
    statusChangeReason:
      typeof order.statusChangeReason === "string" ? order.statusChangeReason : undefined,
    statusChangedByRole: normalizedRole,
    statusChangedByName:
      typeof order.statusChangedByName === "string" ? order.statusChangedByName : undefined,
  };
}
