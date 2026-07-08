"use client";

import { SubscriptionPlan, PlanStatus, PLAN_BADGE_OPTIONS } from "@/features/subscription-plans/types/subscription-plan";

interface GeneralTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<SubscriptionPlan>) => void;
}

export function GeneralTab({ plan, isViewOnly, onUpdate }: GeneralTabProps) {
  return (
    <div className="space-y-8">
      {/* Plan Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Plan Name</label>
        <input
          type="text"
          value={plan.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          disabled={isViewOnly}
          placeholder="e.g., Starter Plan"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Short Description</label>
        <input
          type="text"
          value={plan.shortDescription}
          onChange={(e) => onUpdate({ shortDescription: e.target.value })}
          disabled={isViewOnly}
          placeholder="Brief description for plan cards"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Long Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Long Description</label>
        <textarea
          value={plan.longDescription}
          onChange={(e) => onUpdate({ longDescription: e.target.value })}
          disabled={isViewOnly}
          rows={4}
          placeholder="Detailed description for the plan page"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
        />
      </div>

      {/* Plan Badge */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Plan Badge</label>
        <select
          value={plan.planBadge}
          onChange={(e) => onUpdate({ planBadge: e.target.value })}
          disabled={isViewOnly}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <option value="">No Badge</option>
          {PLAN_BADGE_OPTIONS.map((badge) => (
            <option key={badge} value={badge}>{badge}</option>
          ))}
        </select>
      </div>

      {/* Display Order + Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Display Order</label>
          <input
            type="number"
            value={plan.displayOrder}
            onChange={(e) => onUpdate({ displayOrder: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            min={0}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
          <select
            value={plan.status}
            onChange={(e) => onUpdate({ status: e.target.value as PlanStatus })}
            disabled={isViewOnly}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Featured Plan</p>
          <p className="text-xs text-gray-500">Featured plans are highlighted on the website</p>
        </div>
        <button
          onClick={() => !isViewOnly && onUpdate({ isFeatured: !plan.isFeatured })}
          disabled={isViewOnly}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            plan.isFeatured ? "bg-orange-500" : "bg-gray-300"
          } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              plan.isFeatured ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
