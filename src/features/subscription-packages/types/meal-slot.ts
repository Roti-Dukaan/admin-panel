import { formatDeliverySlotTime } from "@/lib/delivery-slot-display";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type MealSlotStatus = "ACTIVE" | "INACTIVE";
export type CutoffMode = "previous_day" | "same_day" | "hours_before";

export type CutoffRule = {
  mode: CutoffMode;
  time?: string;
  hours?: number;
};

export type PlanMealSlot = {
  id: string;
  planId: string;
  mealType: MealType;
  name: string;
  basePrice: number;
  deliverySlotId: string;
  deliveryWindow: string;
  mealScheduleKey: string | null;
  customizationEnabled: boolean;
  skipEnabled: boolean;
  customizationCutoffRule: CutoffRule;
  skipCutoffRule: CutoffRule | null;
  sortOrder: number;
  status: MealSlotStatus;
};

export type PlanMealBundle = {
  id: string;
  planId: string;
  name: string;
  price: number;
  savingsLabel: string | null;
  sortOrder: number;
  status: MealSlotStatus;
  mealSlotIds: string[];
  mealSlots: PlanMealSlot[];
  individualTotal: number;
  savingsAmount: number;
};

export type MealSlotCatalogue = {
  mealSlots: PlanMealSlot[];
  bundles: PlanMealBundle[];
};

export type UpsertMealSlotInput = {
  id?: string;
  mealType: MealType;
  name: string;
  basePrice: number;
  deliverySlotId: string;
  mealScheduleKey?: string;
  customizationEnabled?: boolean;
  skipEnabled?: boolean;
  customizationCutoffRule: CutoffRule;
  skipCutoffRule?: CutoffRule;
  sortOrder?: number;
  status?: MealSlotStatus;
};

export type UpsertBundleInput = {
  id?: string;
  name: string;
  price: number;
  savingsLabel?: string;
  mealSlotIds: string[];
  sortOrder?: number;
  status?: MealSlotStatus;
};

export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snack" },
];

export const CUTOFF_MODE_OPTIONS: { value: CutoffMode; label: string }[] = [
  { value: "previous_day", label: "Previous day at time (IST)" },
  { value: "same_day", label: "Same day at time (IST)" },
  { value: "hours_before", label: "Hours before slot start" },
];

export function defaultCutoffRule(mode: CutoffMode = "previous_day"): CutoffRule {
  if (mode === "hours_before") return { mode, hours: 24 };
  return { mode, time: mode === "previous_day" ? "22:00" : "12:00" };
}

export function formatCutoffRule(rule: CutoffRule | null | undefined): string {
  if (!rule) return "—";
  if (rule.mode === "hours_before") return `${rule.hours ?? 24}h before slot`;
  const time = rule.time ? formatDeliverySlotTime(rule.time) : "";
  return `${rule.mode === "previous_day" ? "Prev day" : "Same day"} ${time}`.trim();
}
