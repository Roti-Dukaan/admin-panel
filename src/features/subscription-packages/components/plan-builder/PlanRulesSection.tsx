"use client";

import type { PlanBuilderForm, PlanRulesConfig } from "../../types/plan-builder";

interface PlanRulesSectionProps {
  rules: PlanRulesConfig;
  disabled?: boolean;
  onChange: (rules: PlanRulesConfig) => void;
}

export function PlanRulesSection({ rules, disabled, onChange }: PlanRulesSectionProps) {
  const patch = (section: keyof PlanRulesConfig, value: Partial<PlanRulesConfig[keyof PlanRulesConfig]>) => {
    onChange({ ...rules, [section]: { ...rules[section], ...value } });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="mb-3 text-sm font-bold text-gray-900">Meal Customization</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.mealCustomization.allowed}
              onChange={(e) => patch("mealCustomization", { allowed: e.target.checked })}
            />
            Allow customer meal customization
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Modification Cutoff Time</span>
            <input
              type="time"
              disabled={disabled}
              value={rules.mealCustomization.modificationCutoffTime}
              onChange={(e) => patch("mealCustomization", { modificationCutoffTime: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Cutoff Type</span>
            <select
              disabled={disabled}
              value={rules.mealCustomization.cutoffType}
              onChange={(e) =>
                patch("mealCustomization", {
                  cutoffType: e.target.value as PlanRulesConfig["mealCustomization"]["cutoffType"],
                })
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            >
              <option value="PREVIOUS_DAY">Previous Day</option>
              <option value="SAME_DAY">Same Day</option>
              <option value="HOURS_BEFORE">Hours Before</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="mb-3 text-sm font-bold text-gray-900">Skip Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.skip.allowed}
              onChange={(e) => patch("skip", { allowed: e.target.checked })}
            />
            Allow skip
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Maximum Skips</span>
            <input
              type="number"
              min={0}
              disabled={disabled || !rules.skip.allowed}
              value={rules.skip.maximumSkips}
              onChange={(e) => patch("skip", { maximumSkips: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Skip Cutoff (hours)</span>
            <input
              type="number"
              min={0}
              disabled={disabled || !rules.skip.allowed}
              value={rules.skip.skipCutoffHours}
              onChange={(e) => patch("skip", { skipCutoffHours: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="col-span-2 block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Skip Behaviour</span>
            <select
              disabled={disabled || !rules.skip.allowed}
              value={rules.skip.behaviour}
              onChange={(e) =>
                patch("skip", {
                  behaviour: e.target.value as PlanRulesConfig["skip"]["behaviour"],
                })
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            >
              <option value="EXTEND_SUBSCRIPTION">Extend Subscription</option>
              <option value="CONSUME_SUBSCRIPTION_DAY">Consume Subscription Day</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="mb-3 text-sm font-bold text-gray-900">Pause Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.pause.allowed}
              onChange={(e) => patch("pause", { allowed: e.target.checked })}
            />
            Allow pause
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Minimum Pause Days</span>
            <input
              type="number"
              min={1}
              disabled={disabled || !rules.pause.allowed}
              value={rules.pause.minimumPauseDays}
              onChange={(e) => patch("pause", { minimumPauseDays: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Maximum Pause Days</span>
            <input
              type="number"
              min={1}
              disabled={disabled || !rules.pause.allowed}
              value={rules.pause.maximumPauseDays}
              onChange={(e) => patch("pause", { maximumPauseDays: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Maximum Pauses</span>
            <input
              type="number"
              min={0}
              disabled={disabled || !rules.pause.allowed}
              value={rules.pause.maximumPauses}
              onChange={(e) => patch("pause", { maximumPauses: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h4 className="mb-3 text-sm font-bold text-gray-900">Subscription Start Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.subscriptionStart.customerSelectsStartDate}
              onChange={(e) => patch("subscriptionStart", { customerSelectsStartDate: e.target.checked })}
            />
            Customer can select start date
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Earliest Allowed Start</span>
            <select
              disabled={disabled}
              value={rules.subscriptionStart.earliestStart}
              onChange={(e) =>
                patch("subscriptionStart", {
                  earliestStart: e.target.value as PlanRulesConfig["subscriptionStart"]["earliestStart"],
                })
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            >
              <option value="NEXT_DAY">Next Day</option>
              <option value="TODAY">Today</option>
              <option value="CUSTOM_DAYS">Custom Days From Now</option>
            </select>
          </label>
          {rules.subscriptionStart.earliestStart === "CUSTOM_DAYS" && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Days From Now</span>
              <input
                type="number"
                min={0}
                disabled={disabled}
                value={rules.subscriptionStart.earliestStartDays}
                onChange={(e) => patch("subscriptionStart", { earliestStartDays: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
              />
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Booking Cutoff Time</span>
            <input
              type="time"
              disabled={disabled}
              value={rules.subscriptionStart.bookingCutoffTime}
              onChange={(e) => patch("subscriptionStart", { bookingCutoffTime: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
