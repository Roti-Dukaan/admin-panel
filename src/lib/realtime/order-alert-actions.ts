/** Imperative hooks from BranchOrderAlertProvider for other features (e.g. kitchen board). */

import type { BranchOrderNewPayload } from "@/lib/realtime/events";

export type OrderAlertActions = {
  resolveOrder: (orderId: string) => void;
  ensureRinging: (orderId: string) => void;
  alertNewOrder: (payload: BranchOrderNewPayload) => void;
};

let actions: OrderAlertActions | null = null;

export function registerOrderAlertActions(next: OrderAlertActions): void {
  actions = next;
}

export function unregisterOrderAlertActions(): void {
  actions = null;
}

/** Stop ring + close alert when kitchen marks an order preparing. */
export function resolveOrderAlert(orderId: string): void {
  actions?.resolveOrder(orderId);
}

/** Re-attempt ring for an order (e.g. ticket created after deferred scheduled release). */
export function ensureOrderAlertRinging(orderId: string): void {
  actions?.ensureRinging(orderId);
}

/** Show popup + ring when a new pending order appears (e.g. poll fallback while offline). */
export function alertNewKitchenOrder(payload: BranchOrderNewPayload): void {
  actions?.alertNewOrder(payload);
}
