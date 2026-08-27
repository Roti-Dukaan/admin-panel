"use client";

import type { DurationUnit, PlanBuilderForm, PublishStatus } from "../../types/plan-builder";

interface PlanDetailsSectionProps {
  form: PlanBuilderForm;
  disabled?: boolean;
  errors: Record<string, string>;
  onChange: (patch: Partial<PlanBuilderForm>) => void;
}

export function PlanDetailsSection({ form, disabled, errors, onChange }: PlanDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-700">Plan Name</span>
        <input
          disabled={disabled}
          value={form.planName}
          onChange={(e) => onChange({ planName: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="Monthly Meal Subscription"
        />
        {errors.planName && <p className="mt-1 text-xs text-red-600">{errors.planName}</p>}
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-700">Description</span>
        <textarea
          disabled={disabled}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="Describe what customers get with this plan"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-700">Plan Image URL</span>
        <input
          disabled={disabled}
          value={form.planImageUrl}
          onChange={(e) => onChange({ planImageUrl: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="https://..."
        />
        {form.planImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.planImageUrl} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Duration</span>
          <input
            disabled={disabled}
            type="number"
            min={1}
            value={form.durationValue}
            onChange={(e) => onChange({ durationValue: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          />
          {errors.durationValue && <p className="mt-1 text-xs text-red-600">{errors.durationValue}</p>}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Duration Unit</span>
          <select
            disabled={disabled}
            value={form.durationUnit}
            onChange={(e) => onChange({ durationUnit: e.target.value as DurationUnit })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          >
            <option value="DAYS">Days</option>
            <option value="WEEKS">Weeks</option>
            <option value="MONTHS">Months</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-700">Status</span>
        <select
          disabled={disabled}
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value as PublishStatus })}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </label>
    </div>
  );
}
