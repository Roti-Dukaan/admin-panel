import type { OrderStatus } from "../types/order"

/** Normalize backend enum (PENDING_CONFIRMATION) to frontend kebab-case. */
export function normalizeOrderStatus(status: string): OrderStatus {
  return (status.toLowerCase().replace(/_/g, "-") as OrderStatus) || "pending"
}

/** Convert frontend status to backend OrderStatus enum. */
export function toBackendOrderStatus(status: OrderStatus): string {
  return status.toUpperCase().replace(/-/g, "_")
}

/** Valid next statuses — aligned with backend OrderValidator.validateStatusTransition. */
export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  "pending-confirmation": "confirmed",
  confirmed: "accepted",
  accepted: "preparing",
  preparing: "ready-for-pickup",
  "ready-for-pickup": "picked-up",
  "picked-up": "out-for-delivery",
  "out-for-delivery": "delivered",
}

export const STATUS_ACTION_LABELS: Record<string, string> = {
  confirmed: "Confirm Order",
  accepted: "Accept Order",
  preparing: "Start Preparing",
  "ready-for-pickup": "Mark Ready for Pickup",
  "picked-up": "Mark Picked Up",
  "out-for-delivery": "Mark Out For Delivery",
  delivered: "Mark Delivered",
}
