import type { PaymentMethod, OrderType } from "../types/order"

/** Map frontend payment method to backend CartPaymentMethod enum. */
export function toBackendPaymentMethod(method: PaymentMethod): string {
  return method.toUpperCase()
}

/** Map frontend order type to backend OrderType enum. */
export function toBackendOrderType(type: OrderType): string {
  return type.toUpperCase()
}
