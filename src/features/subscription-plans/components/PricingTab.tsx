"use client";

import { SubscriptionPlan, PlanPricing } from "@/features/subscription-plans/types/subscription-plan";

interface PricingTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<PlanPricing>) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function PricingTab({ plan, isViewOnly, onUpdate }: PricingTabProps) {
  const p = plan.pricing;

  return (
    <div className="space-y-8">
      {/* Price Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Pricing Tiers</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "weeklyPrice" as const, label: "Weekly Price", period: "/week" },
            { key: "monthlyPrice" as const, label: "Monthly Price", period: "/month" },
            { key: "quarterlyPrice" as const, label: "Quarterly Price", period: "/quarter" },
            { key: "yearlyPrice" as const, label: "Yearly Price", period: "/year" },
          ].map((tier) => (
            <div key={tier.key} className="rounded-xl border border-gray-200 bg-white p-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">{tier.label}</label>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  value={p[tier.key]}
                  onChange={(e) => onUpdate({ [tier.key]: parseInt(e.target.value) || 0 })}
                  disabled={isViewOnly}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-lg font-bold text-gray-900 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <span className="text-sm text-gray-400 shrink-0">{tier.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offer & Strike Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Offer Price (₹)</label>
          <input
            type="number"
            value={p.offerPrice}
            onChange={(e) => onUpdate({ offerPrice: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <p className="mt-1 text-xs text-gray-400">Set to 0 for no offer</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Strike Price (₹)</label>
          <input
            type="number"
            value={p.strikePrice}
            onChange={(e) => onUpdate({ strikePrice: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <p className="mt-1 text-xs text-gray-400">Original price for showing discount</p>
        </div>
      </div>

      {/* GST & Delivery */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">GST %</label>
          <input
            type="number"
            value={p.gstPercent}
            onChange={(e) => onUpdate({ gstPercent: parseFloat(e.target.value) || 0 })}
            disabled={isViewOnly}
            min={0}
            max={100}
            step={0.5}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Currency</label>
          <select
            value={p.currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            disabled={isViewOnly}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>

      {/* Delivery Charges */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Delivery Charges (₹)</label>
          <input
            type="number"
            value={p.deliveryCharges}
            onChange={(e) => onUpdate({ deliveryCharges: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly || p.freeDelivery}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div className="flex items-end">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 w-full">
            <div>
              <p className="text-sm font-semibold text-gray-900">Free Delivery</p>
              <p className="text-xs text-gray-500">Waive delivery charges</p>
            </div>
            <button
              onClick={() => !isViewOnly && onUpdate({ freeDelivery: !p.freeDelivery })}
              disabled={isViewOnly}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                p.freeDelivery ? "bg-orange-500" : "bg-gray-300"
              } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  p.freeDelivery ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3">Price Summary</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Weekly</span>
            <span className="font-semibold text-gray-900">{formatCurrency(p.weeklyPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Monthly</span>
            <span className="font-semibold text-gray-900">{formatCurrency(p.monthlyPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Quarterly</span>
            <span className="font-semibold text-gray-900">{formatCurrency(p.quarterlyPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Yearly</span>
            <span className="font-semibold text-gray-900">{formatCurrency(p.yearlyPrice)}</span>
          </div>
          {p.offerPrice > 0 && (
            <div className="col-span-2 flex justify-between border-t border-orange-200 pt-2">
              <span className="text-orange-600 font-medium">Offer Price</span>
              <span className="font-bold text-orange-600">{formatCurrency(p.offerPrice)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
