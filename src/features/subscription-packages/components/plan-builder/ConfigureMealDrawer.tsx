"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ApiFoodItem } from "@/lib/types/api";
import { WEEKDAYS, type MealOptionConfig, type Weekday } from "../../types/plan-builder";
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
  onSave: (defaults: Record<string, string>) => void;
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
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !mealOption || !day) {
      setDefaults({});
      return;
    }
    const dayCfg = mealOption.weeklySchedule.find((d) => d.day === day);
    setDefaults({ ...(dayCfg?.defaults ?? {}) });
  }, [open, mealOption, day]);

  const dayLabel = WEEKDAYS.find((d) => d.key === day)?.label ?? day ?? "";
  const optionLabel = mealOption ? getMealOptionLabel(mealOption, mealOptionIndex) : "";
  const errPrefix = `mealOption.${mealOptionIndex}.${day}`;

  if (!open || !mealOption || !day) return null;

  const groups = mealOption.mealGroups ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {dayLabel} — {optionLabel}
            </h3>
            <p className="text-xs text-gray-500">Choose the default product for each meal group on this day</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!groups.length ? (
            <p className="text-sm text-gray-500">
              Add universal meal groups under Meal Options first, then configure defaults here.
            </p>
          ) : (
            groups.map((group, gIdx) => (
              <div key={group.id} className="rounded-xl border border-gray-200 p-4">
                <p className="mb-1 text-sm font-bold text-gray-900">
                  {group.groupName.trim() || `Meal Group ${gIdx + 1}`}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  {group.selectionRule.replace(/_/g, " ").toLowerCase()} · Qty {group.quantity}
                </p>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-gray-700">Default Product</span>
                  <select
                    disabled={disabled}
                    value={defaults[group.id] ?? ""}
                    onChange={(e) =>
                      setDefaults((prev) => ({ ...prev, [group.id]: e.target.value }))
                    }
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
            ))
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
                onSave(defaults);
                onClose();
              }}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Save Defaults
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
