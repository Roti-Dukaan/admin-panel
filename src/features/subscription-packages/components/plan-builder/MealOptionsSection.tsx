"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DeliverySlot } from "@/lib/api/delivery-slots.api";
import type { MealOptionConfig, PlanBuilderConfig } from "../../types/plan-builder";
import { emptyMealOption } from "../../types/plan-builder";

function formatSlotWindow(slot: DeliverySlot): string {
  return `${slot.startTime} – ${slot.endTime}`;
}

interface MealOptionsSectionProps {
  config: PlanBuilderConfig;
  deliverySlots: DeliverySlot[];
  disabled?: boolean;
  errors: Record<string, string>;
  onChange: (config: PlanBuilderConfig) => void;
}

export function MealOptionsSection({
  config,
  deliverySlots,
  disabled,
  errors,
  onChange,
}: MealOptionsSectionProps) {
  const updateOption = (idx: number, patch: Partial<MealOptionConfig>) => {
    const mealOptions = config.mealOptions.map((o, i) => (i === idx ? { ...o, ...patch } : o));
    onChange({ ...config, mealOptions });
  };

  const removeOption = (idx: number) => {
    onChange({ ...config, mealOptions: config.mealOptions.filter((_, i) => i !== idx) });
  };

  const toggleSlot = (idx: number, slotId: string) => {
    const option = config.mealOptions[idx];
    const ids = option.allowedSchedulingSlotIds.includes(slotId)
      ? option.allowedSchedulingSlotIds.filter((id) => id !== slotId)
      : [...option.allowedSchedulingSlotIds, slotId];
    updateOption(idx, { allowedSchedulingSlotIds: ids });
  };

  return (
    <div className="space-y-4">
      {errors.mealOptions && <p className="text-xs text-red-600">{errors.mealOptions}</p>}

      {config.mealOptions.map((option, idx) => (
        <div key={option.id} className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-gray-900">Meal Option {idx + 1}</p>
            {!disabled && (
              <button type="button" onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Meal Option Name</span>
              <input
                disabled={disabled}
                value={option.name}
                onChange={(e) => updateOption(idx, { name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                placeholder="e.g. Lunch, Dinner, Gym Meal"
              />
              {errors[`mealOption.${idx}.name`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`mealOption.${idx}.name`]}</p>
              )}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Subscription Price (₹)</span>
              <input
                disabled={disabled}
                type="number"
                min={0}
                value={option.price}
                onChange={(e) => updateOption(idx, { price: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
              />
              {errors[`mealOption.${idx}.price`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`mealOption.${idx}.price`]}</p>
              )}
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Available Scheduling Slots</p>
              <p className="mb-2 text-xs text-gray-500">From existing delivery slot configuration</p>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-2">
                {deliverySlots.length === 0 ? (
                  <p className="py-2 text-center text-xs text-gray-400">No delivery slots configured</p>
                ) : (
                  deliverySlots.map((slot) => (
                    <label key={slot.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={option.allowedSchedulingSlotIds.includes(slot.id)}
                        onChange={() => toggleSlot(idx, slot.id)}
                      />
                      <span className="text-sm text-gray-800">{slot.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{formatSlotWindow(slot)}</span>
                    </label>
                  ))
                )}
              </div>
              {errors[`mealOption.${idx}.slots`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`mealOption.${idx}.slots`]}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={() =>
            onChange({ ...config, mealOptions: [...config.mealOptions, emptyMealOption()] })
          }
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Meal Option
        </button>
      )}
    </div>
  );
}

export function getMealOptionLabel(option: MealOptionConfig, index: number): string {
  return option.name.trim() || `Meal Option ${index + 1}`;
}
