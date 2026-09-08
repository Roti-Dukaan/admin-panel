"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import type { ApiFoodItem } from "@/lib/types/api";
import {
  SELECTION_RULE_OPTIONS,
  type MealGroupTemplate,
  type MealOptionConfig,
} from "../../types/plan-builder";
import { addMealGroupTemplate, syncDayDefaults } from "../../utils/plan-builder-schedule.util";

interface UniversalMealGroupsEditorProps {
  option: MealOptionConfig;
  optionIndex: number;
  products: ApiFoodItem[];
  disabled?: boolean;
  errors: Record<string, string>;
  onChange: (option: MealOptionConfig) => void;
}

export function UniversalMealGroupsEditor({
  option,
  optionIndex,
  products,
  disabled,
  errors,
  onChange,
}: UniversalMealGroupsEditorProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const errPrefix = `mealOption.${optionIndex}.groups`;

  const updateGroup = (idx: number, patch: Partial<MealGroupTemplate>) => {
    const mealGroups = option.mealGroups.map((g, i) => (i === idx ? { ...g, ...patch } : g));
    onChange(syncDayDefaults({ ...option, mealGroups }));
  };

  const removeGroup = (idx: number) => {
    const removedId = option.mealGroups[idx]?.id;
    const mealGroups = option.mealGroups.filter((_, i) => i !== idx);
    const weeklySchedule = option.weeklySchedule.map((day) => {
      if (!removedId) return day;
      const defaults = { ...(day.defaults ?? {}) };
      delete defaults[removedId];
      return { ...day, defaults };
    });
    onChange(syncDayDefaults({ ...option, mealGroups, weeklySchedule }));
  };

  const toggleProduct = (groupIdx: number, productId: string) => {
    const group = option.mealGroups[groupIdx];
    const ids = group.allowedProductIds.includes(productId)
      ? group.allowedProductIds.filter((id) => id !== productId)
      : [...group.allowedProductIds, productId];
    updateGroup(groupIdx, { allowedProductIds: ids });
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Universal Meal Groups</p>
        <p className="text-xs text-gray-500">
          Define groups once — they apply to every delivery day. Pick the default product per day in Meal Schedule.
        </p>
      </div>

      {errors[`${errPrefix}.required`] && (
        <p className="text-xs text-red-600">{errors[`${errPrefix}.required`]}</p>
      )}

      {option.mealGroups.map((group, gIdx) => (
        <div key={group.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Meal Group {gIdx + 1}</p>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeGroup(gIdx)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Group Name</span>
              <input
                disabled={disabled}
                value={group.groupName}
                onChange={(e) => updateGroup(gIdx, { groupName: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                placeholder="e.g. Main Course, Side, Beverage"
              />
              {errors[`${errPrefix}.${gIdx}.name`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`${errPrefix}.${gIdx}.name`]}</p>
              )}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Selection Rule</span>
              <select
                disabled={disabled}
                value={group.selectionRule}
                onChange={(e) =>
                  updateGroup(gIdx, {
                    selectionRule: e.target.value as MealGroupTemplate["selectionRule"],
                  })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
              >
                {SELECTION_RULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Quantity</span>
              <input
                disabled={disabled}
                type="number"
                min={1}
                value={group.quantity}
                onChange={(e) => updateGroup(gIdx, { quantity: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Allowed Products</p>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product catalog..."
                  className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm"
                />
              </div>
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-2">
                {filteredProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={group.allowedProductIds.includes(product.id)}
                      onChange={() => toggleProduct(gIdx, product.id)}
                    />
                    <span className="flex-1 text-sm text-gray-800">{product.name}</span>
                    <span className="text-xs text-gray-500">₹{product.discountPrice ?? product.basePrice}</span>
                  </label>
                ))}
              </div>
              {errors[`${errPrefix}.${gIdx}.products`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`${errPrefix}.${gIdx}.products`]}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={() => onChange(addMealGroupTemplate(option))}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Meal Group
        </button>
      )}
    </div>
  );
}
