"use client";

import { useState, useEffect, useMemo } from "react";
import { SubscriptionPlan, MenuInclusion, MealType, PlanMenuItem } from "@/features/subscription-plans/types/subscription-plan";
import { mockFoods } from "@/features/menu/mock/foods";
import { foodItemApi } from "@/lib/api/food.api";
import { Loader2, Search } from "lucide-react";

interface MenuTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<SubscriptionPlan>) => void;
}

const MENU_CATEGORIES = [
  { key: "rotis" as const, label: "Rotis", emoji: "🌾", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { key: "vegCurries" as const, label: "Veg Curries", emoji: "🥬", color: "text-green-600 bg-green-50 border-green-200" },
  { key: "nonVeg" as const, label: "Non Veg", emoji: "🍗", color: "text-red-600 bg-red-50 border-red-200" },
  { key: "combos" as const, label: "Combos", emoji: "🍱", color: "text-purple-600 bg-purple-50 border-purple-200" },
];

const MEAL_SLOTS: { key: MealType; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
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

  // Real catalog food items (for actual delivered items per meal slot).
  const [foods, setFoods] = useState<Array<{ id: string; name: string; category?: string }>>([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [mealSlot, setMealSlot] = useState<MealType>("lunch");
  const [foodSearch, setFoodSearch] = useState("");

  const menuItems: PlanMenuItem[] = plan.menuItems ?? [];

  useEffect(() => {
    let cancelled = false;
    setFoodsLoading(true);
    foodItemApi
      .list({ limit: 200 })
      .then((res: any) => {
        if (cancelled) return;
        const items = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];
        setFoods(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!cancelled) setFoods([]);
      })
      .finally(() => {
        if (!cancelled) setFoodsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFoods = useMemo(() => {
    const q = foodSearch.toLowerCase().trim();
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [foods, foodSearch]);

  const toggleItem = (category: keyof Pick<MenuInclusion, "rotis" | "vegCurries" | "nonVeg" | "combos">, item: string) => {
    if (isViewOnly) return;
    const current = menu[category];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    onUpdate({ menu: { ...menu, [category]: updated } });
  };

  const toggleMenuItem = (food: { id: string; name: string }) => {
    if (isViewOnly) return;
    const exists = menuItems.find((m) => m.foodItemId === food.id && m.mealSlot === mealSlot);
    const updated = exists
      ? menuItems.filter((m) => !(m.foodItemId === food.id && m.mealSlot === mealSlot))
      : [
          ...menuItems,
          {
            foodItemId: food.id,
            name: food.name,
            mealSlot,
            isDefault: menuItems.filter((m) => m.mealSlot === mealSlot).length === 0,
          },
        ];
    onUpdate({ menuItems: updated });
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
            onChange={(e) => onUpdate({ menu: { ...menu, maxRotis: parseInt(e.target.value) || 1 } })}
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
            onChange={(e) => onUpdate({ menu: { ...menu, maxCurries: parseInt(e.target.value) || 1 } })}
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
            onChange={(e) => onUpdate({ menu: { ...menu, dailyQuantityLimit: parseInt(e.target.value) || 1 } })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* Deliverable Food Items (per meal slot) — maps to backend plan items */}
      <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Deliverable Food Items (per meal)</h4>
          <p className="text-xs text-gray-500">
            These real catalog items are dispatched to the kitchen for each delivery. Select items per meal slot.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {MEAL_SLOTS.map((slot) => {
            const active = mealSlot === slot.key;
            const count = menuItems.filter((m) => m.mealSlot === slot.key).length;
            return (
              <button
                key={slot.key}
                onClick={() => setMealSlot(slot.key)}
                disabled={isViewOnly}
                className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {slot.label}
                {count > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative mb-3 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            placeholder="Search catalog food items…"
            disabled={isViewOnly}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-200"
          />
        </div>

        {foodsLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading catalog…
          </div>
        ) : (
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
            {filteredFoods.map((food) => {
              const active = menuItems.find((m) => m.foodItemId === food.id && m.mealSlot === mealSlot);
              return (
                <button
                  key={food.id}
                  onClick={() => toggleMenuItem(food)}
                  disabled={isViewOnly}
                  className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all ${
                    active
                      ? "border-orange-400 bg-orange-100 text-orange-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
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
                  <span className="font-medium">{food.name}</span>
                </button>
              );
            })}
            {filteredFoods.length === 0 && (
              <p className="col-span-2 py-4 text-center text-sm text-gray-400">No catalog items found.</p>
            )}
          </div>
        )}

        {menuItems.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {menuItems.map((m) => (
              <span
                key={`${m.mealSlot}-${m.foodItemId}`}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-orange-200"
              >
                {m.mealSlot}: {m.name}
                {!isViewOnly && (
                  <button
                    onClick={() => toggleMenuItem({ id: m.foodItemId, name: m.name })}
                    className="ml-0.5 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
