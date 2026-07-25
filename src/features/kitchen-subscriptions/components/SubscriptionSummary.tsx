"use client";

import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionProductionSummary } from "../types/kitchen-subscriptions";

const MEAL_SLOTS = [
  { key: "breakfast" as const, label: "Breakfast", emoji: "🌅", color: "text-orange-600" },
  { key: "lunch" as const, label: "Lunch", emoji: "☀️", color: "text-yellow-600" },
  { key: "dinner" as const, label: "Dinner", emoji: "🌙", color: "text-indigo-600" },
];

export function SubscriptionSummary({ summary }: { summary: SubscriptionProductionSummary | undefined }) {
  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ChefHat className="h-4 w-4 text-orange-500" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
          Today&apos;s Subscription Production
        </h2>
      </div>

      <div className="space-y-3">
        {MEAL_SLOTS.map((slot) => {
          const data = summary[slot.key];
          return (
            <div key={slot.key} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <span>{slot.emoji}</span>
                  {slot.label}
                </span>
                <span className={cn("text-sm font-bold", slot.color)}>
                  {data.totalOrders} orders
                </span>
              </div>
              <div className="mt-1.5 flex gap-3 text-xs text-gray-500">
                <span>🥗 Veg: {data.vegMeals}</span>
                <span>🍖 Non-Veg: {data.nonVegMeals}</span>
                <span>🫓 Rotis: {data.totalRotis}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="font-bold text-gray-900">{summary.totalOrders}</p>
            <p className="text-gray-500">Total Orders</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="font-bold text-gray-900">{summary.totalRotis}</p>
            <p className="text-gray-500">Total Rotis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
