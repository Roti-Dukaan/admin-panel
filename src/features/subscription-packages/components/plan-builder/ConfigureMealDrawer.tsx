"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { ApiFoodItem } from "@/lib/types/api";
import {
  SELECTION_RULE_OPTIONS,
  WEEKDAYS,
  emptyMealGroup,
  type MealGroupConfig,
  type MealOptionConfig,
  type Weekday,
} from "../../types/plan-builder";
import { getMealOptionLabel } from "./MealOptionsSection";

interface ConfigureMealDrawerProps {
  open: boolean;
  mealOption: MealOptionConfig | null;
  mealOptionIndex: number;
  day: Weekday | null;
  products: ApiFoodItem[];
  disabled?: boolean;
  errors: Record<string, string>;
  onClose: () => void;
  onSave: (mealGroups: MealGroupConfig[]) => void;
}

export function ConfigureMealDrawer({
  open,
  mealOption,
  mealOptionIndex,
  day,
  products,
  disabled,
  errors,
  onClose,
  onSave,
}: ConfigureMealDrawerProps) {
  const [groups, setGroups] = useState<MealGroupConfig[]>([]);

  useEffect(() => {
    if (!open || !mealOption || !day) {
      setGroups([]);
      return;
    }
    const dayCfg = mealOption.weeklySchedule.find((d) => d.day === day);
    setGroups(dayCfg?.mealGroups?.length ? dayCfg.mealGroups.map((g) => ({ ...g })) : []);
  }, [open, mealOption, day]);

  const dayLabel = WEEKDAYS.find((d) => d.key === day)?.label ?? day ?? "";
  const optionLabel = mealOption ? getMealOptionLabel(mealOption, mealOptionIndex) : "";
  const allowedProducts = mealOption?.allowedProductIds ?? [];
  const selectableProducts = products.filter((p) => allowedProducts.includes(p.id));

  if (!open || !mealOption || !day) return null;

  const updateGroup = (idx: number, patch: Partial<MealGroupConfig>) => {
    setGroups((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const errPrefix = `mealOption.${mealOptionIndex}.${day}`;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {dayLabel} — {optionLabel}
            </h3>
            <p className="text-xs text-gray-500">Configure meal groups for this delivery day</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {allowedProducts.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Add allowed products in Meal Options &amp; Pricing before configuring this day.
            </div>
          )}

          {groups.map((group, gIdx) => (
            <div key={group.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">Meal Group {gIdx + 1}</p>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => setGroups((prev) => prev.filter((_, i) => i !== gIdx))}
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
                    placeholder="e.g. Roti, Curry, Side"
                  />
                  {errors[`${errPrefix}.group.${gIdx}.name`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${errPrefix}.group.${gIdx}.name`]}</p>
                  )}
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Selection Rule</span>
                  <select
                    disabled={disabled}
                    value={group.selectionRule}
                    onChange={(e) =>
                      updateGroup(gIdx, {
                        selectionRule: e.target.value as MealGroupConfig["selectionRule"],
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

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Default Product</span>
                  <select
                    disabled={disabled || selectableProducts.length === 0}
                    value={group.defaultProductId}
                    onChange={(e) => updateGroup(gIdx, { defaultProductId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2"
                  >
                    <option value="">Select product</option>
                    {selectableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — ₹{product.discountPrice ?? product.basePrice}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose from this meal option&apos;s allowed products
                  </p>
                  {errors[`${errPrefix}.group.${gIdx}.default`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${errPrefix}.group.${gIdx}.default`]}</p>
                  )}
                </label>
              </div>
            </div>
          ))}

          {!disabled && (
            <button
              type="button"
              onClick={() =>
                setGroups((prev) => [
                  ...prev,
                  {
                    ...emptyMealGroup(),
                    defaultProductId: allowedProducts[0] ?? "",
                  },
                ])
              }
              disabled={allowedProducts.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Meal Group
            </button>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          {!disabled && (
            <button
              type="button"
              onClick={() => {
                onSave(groups);
                onClose();
              }}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Save Meal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
