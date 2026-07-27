"use client";

import { cn } from "@/lib/utils";
import type { SubscriptionKitchenStage, MealSlot } from "../types/kitchen-subscriptions";

const MEAL_SLOT_OPTIONS: { value: MealSlot; label: string; emoji: string }[] = [
  { value: "all", label: "All Meals", emoji: "🍽️" },
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
];

const STATUS_OPTIONS: { value: SubscriptionKitchenStage | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "READY_FOR_DISPATCH", label: "Ready For Dispatch" },
];

export function SubscriptionFilters({
  mealSlot,
  onMealSlot,
  status,
  onStatus,
}: {
  mealSlot: MealSlot;
  onMealSlot: (v: MealSlot) => void;
  status: SubscriptionKitchenStage | "all";
  onStatus: (v: SubscriptionKitchenStage | "all") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Meal Slot Filter */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
        {MEAL_SLOT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onMealSlot(opt.value)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mealSlot === opt.value
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <span>{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value as SubscriptionKitchenStage | "all")}
        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-orange-300 focus:outline-none"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
