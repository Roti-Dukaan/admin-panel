"use client";

import { useState } from "react";
import { SubscriptionPlan, MenuInclusion } from "@/features/subscription-plans/types/subscription-plan";
import { mockFoods } from "@/features/menu/mock/foods";

interface MenuTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<MenuInclusion>) => void;
}

const MENU_CATEGORIES = [
  { key: "rotis" as const, label: "Rotis", emoji: "🌾", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { key: "vegCurries" as const, label: "Veg Curries", emoji: "🥬", color: "text-green-600 bg-green-50 border-green-200" },
  { key: "nonVeg" as const, label: "Non Veg", emoji: "🍗", color: "text-red-600 bg-red-50 border-red-200" },
  { key: "combos" as const, label: "Combos", emoji: "🍱", color: "text-purple-600 bg-purple-50 border-purple-200" },
];

function getItemsForCategory(category: string): string[] {
  const catMap: Record<string, string> = {
    rotis: "rotis",
    vegCurries: "veg",
    nonVeg: "non-veg",
    combos: "combos",
  };
  return mockFoods
    .filter((f) => f.category === catMap[category])
    .map((f) => f.name);
}

export function MenuTab({ plan, isViewOnly, onUpdate }: MenuTabProps) {
  const [activeCategory, setActiveCategory] = useState("rotis");
  const menu = plan.menu;

  const toggleItem = (category: keyof Pick<MenuInclusion, "rotis" | "vegCurries" | "nonVeg" | "combos">, item: string) => {
    if (isViewOnly) return;
    const current = menu[category];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    onUpdate({ [category]: updated });
  };

  const availableItems = getItemsForCategory(activeCategory);
  const categoryKey = activeCategory as keyof Pick<MenuInclusion, "rotis" | "vegCurries" | "nonVeg" | "combos">;

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Menu Categories</label>
        <div className="flex gap-2">
          {MENU_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            const selectedCount = menu[cat.key].length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? cat.color + " border-current"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {selectedCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-current/10 px-1 text-[10px] font-bold">
                    {selectedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">
            {MENU_CATEGORIES.find((c) => c.key === activeCategory)?.emoji}{" "}
            {MENU_CATEGORIES.find((c) => c.key === activeCategory)?.label}
          </h4>
          <span className="text-xs text-gray-500">
            {menu[categoryKey].length} of {availableItems.length} selected
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableItems.map((item) => {
            const active = menu[categoryKey].includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleItem(categoryKey, item)}
                disabled={isViewOnly}
                className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all ${
                  active
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                    active ? "border-orange-500 bg-orange-500" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Max Rotis</label>
          <input
            type="number"
            value={menu.maxRotis}
            onChange={(e) => onUpdate({ maxRotis: parseInt(e.target.value) || 1 })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Max Curries</label>
          <input
            type="number"
            value={menu.maxCurries}
            onChange={(e) => onUpdate({ maxCurries: parseInt(e.target.value) || 1 })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Daily Qty Limit</label>
          <input
            type="number"
            value={menu.dailyQuantityLimit}
            onChange={(e) => onUpdate({ dailyQuantityLimit: parseInt(e.target.value) || 1 })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>
    </div>
  );
}
