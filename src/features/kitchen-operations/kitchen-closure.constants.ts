export type KitchenClosureReasonCode =
  | "MAINTENANCE"
  | "HIGH_ORDER_VOLUME"
  | "INGREDIENT_STOCK_UNAVAILABLE"
  | "STAFF_UNAVAILABLE"
  | "POWER_OUTAGE"
  | "TEMPORARY_OPERATIONAL_ISSUE"
  | "OTHER";

export const KITCHEN_CLOSURE_REASON_OPTIONS: { value: KitchenClosureReasonCode; label: string }[] = [
  { value: "MAINTENANCE", label: "Kitchen maintenance" },
  { value: "HIGH_ORDER_VOLUME", label: "High order volume" },
  { value: "INGREDIENT_STOCK_UNAVAILABLE", label: "Ingredient stock unavailable" },
  { value: "STAFF_UNAVAILABLE", label: "Staff unavailable" },
  { value: "POWER_OUTAGE", label: "Power outage" },
  { value: "TEMPORARY_OPERATIONAL_ISSUE", label: "Temporary operational issue" },
  { value: "OTHER", label: "Other" },
];

export type KitchenTemporaryClosePayload = {
  closureReasonCode: KitchenClosureReasonCode;
  closureReasonCustom?: string;
  scheduledReopenAt: string;
};

export function defaultScheduledReopenLocalValue(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 120);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDatetimeLocalValue(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
