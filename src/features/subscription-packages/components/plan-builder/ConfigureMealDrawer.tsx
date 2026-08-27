"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open || !mealOption || !day) {
      setGroups([]);
      setSearch("");
      return;
    }
    const dayCfg = mealOption.weeklySchedule.find((d) => d.day === day);
    setGroups(dayCfg?.mealGroups?.length ? dayCfg.mealGroups.map((g) => ({ ...g })) : []);
    setSearch("");
  }, [open, mealOption, day]);

  const dayLabel = WEEKDAYS.find((d) => d.key === day)?.label ?? day ?? "";
  const optionLabel = mealOption ? getMealOptionLabel(mealOption, mealOptionIndex) : "";

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  if (!open || !mealOption || !day) return null;

  const updateGroup = (idx: number, patch: Partial<MealGroupConfig>) => {
    setGroups((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const toggleProduct = (groupIdx: number, productId: string) => {
    const group = groups[groupIdx];
    const ids = group.allowedProductIds.includes(productId)
      ? group.allowedProductIds.filter((id) => id !== productId)
      : [...group.allowedProductIds, productId];
    const defaultProductId =
      group.defaultProductId && ids.includes(group.defaultProductId)
        ? group.defaultProductId
        : ids[0] ?? "";
    updateGroup(groupIdx, { allowedProductIds: ids, defaultProductId });
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
                  {errors[`${errPrefix}.group.${gIdx}.products`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`${errPrefix}.group.${gIdx}.products`]}</p>
                  )}
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Default Product</span>
                  <select
                    disabled={disabled}
                    value={group.defaultProductId}
                    onChange={(e) => updateGroup(gIdx, { defaultProductId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2"
                  >
                    <option value="">Select default</option>
                    {group.allowedProductIds.map((id) => {
                      const p = products.find((x) => x.id === id);
                      return (
                        <option key={id} value={id}>
                          {p?.name ?? id}
                        </option>
                      );
                    })}
                  </select>
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
              onClick={() => setGroups((prev) => [...prev, emptyMealGroup()])}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
