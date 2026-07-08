"use client";

import { SubscriptionPlan, MealConfiguration, MealType, ALL_MEAL_TYPES } from "@/features/subscription-plans/types/subscription-plan";

interface MealsTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<MealConfiguration>) => void;
}

const MEAL_LABELS: Record<MealType, { label: string; emoji: string; color: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅", color: "text-amber-600 bg-amber-50 border-amber-200" },
  lunch: { label: "Lunch", emoji: "☀️", color: "text-orange-600 bg-orange-50 border-orange-200" },
  dinner: { label: "Dinner", emoji: "🌙", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
};

export function MealsTab({ plan, isViewOnly, onUpdate }: MealsTabProps) {
  const meals = plan.meals;

  const toggleMealType = (type: MealType) => {
    if (isViewOnly) return;
    const current = meals.mealsAvailable;
    const updated = current.includes(type)
      ? current.filter((m) => m !== type)
      : [...current, type];
    onUpdate({ mealsAvailable: updated });
  };

  return (
    <div className="space-y-8">
      {/* Meals Available */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Meals Available</label>
        <div className="grid grid-cols-3 gap-3">
          {ALL_MEAL_TYPES.map((type) => {
            const cfg = MEAL_LABELS[type];
            const active = meals.mealsAvailable.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleMealType(type)}
                disabled={isViewOnly}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  active
                    ? `${cfg.color} border-current shadow-sm`
                    : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="text-2xl">{cfg.emoji}</span>
                <p className="mt-1 text-sm font-semibold">{cfg.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Meal Count */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Daily Meal Count</label>
        <p className="text-xs text-gray-500 mb-3">Number of meals per day</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              onClick={() => !isViewOnly && onUpdate({ dailyMealCount: count })}
              disabled={isViewOnly}
              className={`h-12 w-12 rounded-xl text-lg font-bold transition-all ${
                meals.dailyMealCount === count
                  ? "bg-orange-500 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Rotis & Curries */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Rotis Per Meal</label>
          <input
            type="number"
            value={meals.rotisPerMeal}
            onChange={(e) => onUpdate({ rotisPerMeal: parseInt(e.target.value) || 1 })}
            disabled={isViewOnly}
            min={1}
            max={10}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Curries Included</label>
          <input
            type="number"
            value={meals.curriesIncluded}
            onChange={(e) => onUpdate({ curriesIncluded: parseInt(e.target.value) || 1 })}
            disabled={isViewOnly}
            min={1}
            max={5}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* Toggle Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Extra Curry Allowed</p>
            <p className="text-xs text-gray-500">Allow customers to add extra curries</p>
          </div>
          <button
            onClick={() => !isViewOnly && onUpdate({ extraCurryAllowed: !meals.extraCurryAllowed })}
            disabled={isViewOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              meals.extraCurryAllowed ? "bg-orange-500" : "bg-gray-300"
            } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${meals.extraCurryAllowed ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Extra Roti Allowed</p>
            <p className="text-xs text-gray-500">Allow customers to order extra rotis</p>
          </div>
          <button
            onClick={() => !isViewOnly && onUpdate({ extraRotiAllowed: !meals.extraRotiAllowed })}
            disabled={isViewOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              meals.extraRotiAllowed ? "bg-orange-500" : "bg-gray-300"
            } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${meals.extraRotiAllowed ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Max Rotis Per Day */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Maximum Rotis Per Day</label>
        <input
          type="number"
          value={meals.maxRotisPerDay}
          onChange={(e) => onUpdate({ maxRotisPerDay: parseInt(e.target.value) || 1 })}
          disabled={isViewOnly}
          min={1}
          max={20}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
      </div>
    </div>
  );
}
