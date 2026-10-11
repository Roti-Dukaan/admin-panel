"use client";

import { WEEKDAYS } from "../../types/plan-builder";
import type { MealOptionConfig, PlanBuilderConfig, Weekday } from "../../types/plan-builder";
import {
  isDayDefaultsComplete,
  setDeliveryDayEnabled,
} from "../../utils/plan-builder-schedule.util";
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
  const toggleDeliveryDay = (option: MealOptionConfig, day: Weekday, enabled: boolean) => {
    const mealOptions = config.mealOptions.map((item) =>
      item.id === option.id ? setDeliveryDayEnabled(item, day, enabled) : item,
    );
    onChange({ ...config, mealOptions });
  };

  if (!config.mealOptions.length) {
    return <p className="text-sm text-gray-500">Add meal options first to configure weekly schedules.</p>;
  }

  return (
    <div className="space-y-6">
      {config.mealOptions.map((option, idx) => (
        <div key={option.id} className="rounded-xl border border-gray-200 p-4">
          <p className="mb-1 text-sm font-bold text-gray-900">Meal Option: {getMealOptionLabel(option, idx)}</p>
          <p className="mb-3 text-xs text-gray-500">
            {option.mealGroups.length
              ? `${option.mealGroups.length} universal group(s) — set default products per delivery day`
              : "Add universal meal groups under Meal Options first"}
          </p>
          <div className="space-y-2">
            {WEEKDAYS.map(({ key, label }) => {
              const dayCfg = option.weeklySchedule.find((d) => d.day === key)!;
              const errKey = `mealOption.${idx}.${key}`;
              const groupCount = option.mealGroups.length;
              const configured = isDayDefaultsComplete(dayCfg, option.mealGroups);
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
                        onChange={(e) => toggleDeliveryDay(option, key, e.target.checked)}
                      />
                      Delivery day
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {!dayCfg.deliveryEnabled ? (
                      <span className="text-xs font-medium text-gray-400">No Delivery</span>
                    ) : !groupCount ? (
                      <span className="text-xs font-medium text-amber-600">Add meal groups first</span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500">
                          {configured ? `${groupCount} default(s) set` : "Defaults incomplete"}
                        </span>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onConfigureMeal(option.id, key)}
                          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          Configure Defaults
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
