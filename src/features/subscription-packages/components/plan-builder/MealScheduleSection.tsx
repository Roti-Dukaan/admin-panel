"use client";

import { WEEKDAYS } from "../../types/plan-builder";
import type { MealOptionConfig, PlanBuilderConfig, Weekday } from "../../types/plan-builder";
import { getMealOptionLabel } from "./MealOptionsSection";

interface MealScheduleSectionProps {
  config: PlanBuilderConfig;
  disabled?: boolean;
  errors: Record<string, string>;
  onConfigureMeal: (mealOptionId: string, day: Weekday) => void;
  onChange: (config: PlanBuilderConfig) => void;
}

export function MealScheduleSection({
  config,
  disabled,
  errors,
  onConfigureMeal,
  onChange,
}: MealScheduleSectionProps) {
  const toggleDeliveryDay = (optionId: string, day: Weekday, enabled: boolean) => {
    const mealOptions = config.mealOptions.map((option) => {
      if (option.id !== optionId) return option;
      return {
        ...option,
        weeklySchedule: option.weeklySchedule.map((d) =>
          d.day === day ? { ...d, deliveryEnabled: enabled, mealGroups: enabled ? d.mealGroups : [] } : d,
        ),
      };
    });
    onChange({ ...config, mealOptions });
  };

  if (!config.mealOptions.length) {
    return <p className="text-sm text-gray-500">Add meal options first to configure weekly schedules.</p>;
  }

  return (
    <div className="space-y-6">
      {config.mealOptions.map((option, idx) => (
        <div key={option.id} className="rounded-xl border border-gray-200 p-4">
          <p className="mb-3 text-sm font-bold text-gray-900">Meal Option: {getMealOptionLabel(option, idx)}</p>
          <div className="space-y-2">
            {WEEKDAYS.map(({ key, label }) => {
              const dayCfg = option.weeklySchedule.find((d) => d.day === key)!;
              const errKey = `mealOption.${idx}.${key}`;
              const configured = dayCfg.mealGroups.length > 0;
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium text-gray-800">{label}</span>
                    <label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={dayCfg.deliveryEnabled}
                        onChange={(e) => toggleDeliveryDay(option.id, key, e.target.checked)}
                      />
                      Delivery day
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {!dayCfg.deliveryEnabled ? (
                      <span className="text-xs font-medium text-gray-400">No Delivery</span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500">
                          {configured ? `${dayCfg.mealGroups.length} group(s)` : "Not configured"}
                        </span>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onConfigureMeal(option.id, key)}
                          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          Configure Meal
                        </button>
                      </>
                    )}
                  </div>
                  {errors[errKey] && <p className="w-full text-xs text-red-600">{errors[errKey]}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
