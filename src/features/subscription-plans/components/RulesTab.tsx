"use client";

import { SubscriptionPlan, PlanRules, RenewalType } from "@/features/subscription-plans/types/subscription-plan";

interface RulesTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<PlanRules>) => void;
}

export function RulesTab({ plan, isViewOnly, onUpdate }: RulesTabProps) {
  const rules = plan.rules;

  return (
    <div className="space-y-8">
      {/* Pause Subscription */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Pause Subscription</p>
            <p className="text-xs text-gray-500">Allow customers to pause their subscription</p>
          </div>
          <button
            onClick={() => !isViewOnly && onUpdate({ pauseAllowed: !rules.pauseAllowed })}
            disabled={isViewOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              rules.pauseAllowed ? "bg-orange-500" : "bg-gray-300"
            } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rules.pauseAllowed ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {rules.pauseAllowed && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Pause Days</label>
              <input
                type="number"
                value={rules.maxPauseDays}
                onChange={(e) => onUpdate({ maxPauseDays: parseInt(e.target.value) || 0 })}
                disabled={isViewOnly}
                min={1}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notice Days</label>
              <input
                type="number"
                value={rules.pauseNoticeDays}
                onChange={(e) => onUpdate({ pauseNoticeDays: parseInt(e.target.value) || 0 })}
                disabled={isViewOnly}
                min={0}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Skip Meals */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Skip Meals</p>
            <p className="text-xs text-gray-500">Allow customers to skip individual meals</p>
          </div>
          <button
            onClick={() => !isViewOnly && onUpdate({ skipMealsAllowed: !rules.skipMealsAllowed })}
            disabled={isViewOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              rules.skipMealsAllowed ? "bg-orange-500" : "bg-gray-300"
            } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rules.skipMealsAllowed ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {rules.skipMealsAllowed && (
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Maximum Skips Per Month</label>
            <input
              type="number"
              value={rules.maxSkips}
              onChange={(e) => onUpdate({ maxSkips: parseInt(e.target.value) || 0 })}
              disabled={isViewOnly}
              min={1}
              className="h-10 w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
        )}
      </div>

      {/* Carry Forward */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">Carry Forward</p>
          <p className="text-xs text-gray-500">Carry forward unused meals to next cycle</p>
        </div>
        <button
          onClick={() => !isViewOnly && onUpdate({ carryForward: !rules.carryForward })}
          disabled={isViewOnly}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            rules.carryForward ? "bg-orange-500" : "bg-gray-300"
          } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rules.carryForward ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Cancellation & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Cancellation Notice (Days)</label>
          <input
            type="number"
            value={rules.cancellationNoticeDays}
            onChange={(e) => onUpdate({ cancellationNoticeDays: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            min={0}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Min Subscription Duration (Days)</label>
          <input
            type="number"
            value={rules.minSubscriptionDays}
            onChange={(e) => onUpdate({ minSubscriptionDays: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* Renewal Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Renewal Type</label>
        <div className="grid grid-cols-2 gap-3">
          {(["automatic", "manual"] as RenewalType[]).map((type) => (
            <button
              key={type}
              onClick={() => !isViewOnly && onUpdate({ renewalType: type })}
              disabled={isViewOnly}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                rules.renewalType === type
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <p className="text-sm font-semibold capitalize">{type}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {type === "automatic" ? "Auto-renew at cycle end" : "Customer renews manually"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
