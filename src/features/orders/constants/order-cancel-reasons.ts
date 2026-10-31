/** Standard cancellation reasons shown to branch managers and kitchen staff. */
export const ORDER_CANCEL_REASON_OPTIONS = [
  "Required ingredients unavailable.",
  "Item currently unavailable.",
  "Kitchen operational issue.",
  "Unable to prepare order on time.",
  "Kitchen equipment issue.",
  "Delivery partner unavailable.",
  "Branch temporarily closed.",
  "Quality standards not met.",
  "Other.",
] as const;

export type OrderCancelReasonOption = (typeof ORDER_CANCEL_REASON_OPTIONS)[number];

export const ORDER_CANCEL_OTHER_OPTION: OrderCancelReasonOption = "Other.";

export function resolveOrderCancelReason(
  selected: OrderCancelReasonOption | null,
  otherText: string,
): string | null {
  if (!selected) return null;
  if (selected === ORDER_CANCEL_OTHER_OPTION) {
    const trimmed = otherText.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return selected;
}
