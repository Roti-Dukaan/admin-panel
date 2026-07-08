"use client";

import { useState } from "react";
import { SubscriptionPlan, DeliveryRules } from "@/features/subscription-plans/types/subscription-plan";
import { Plus, X } from "lucide-react";

interface DeliveryRulesTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<DeliveryRules>) => void;
}

export function DeliveryRulesTab({ plan, isViewOnly, onUpdate }: DeliveryRulesTabProps) {
  const [newPincode, setNewPincode] = useState("");
  const rules = plan.deliveryRules;

  const addPincode = () => {
    if (isViewOnly || !newPincode.trim()) return;
    if (rules.supportedPincodes.includes(newPincode.trim())) return;
    onUpdate({ supportedPincodes: [...rules.supportedPincodes, newPincode.trim()] });
    setNewPincode("");
  };

  const removePincode = (pincode: string) => {
    if (isViewOnly) return;
    onUpdate({ supportedPincodes: rules.supportedPincodes.filter((p) => p !== pincode) });
  };

  return (
    <div className="space-y-8">
      {/* Supported Pincodes */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Supported Pincodes</label>
        {!isViewOnly && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPincode()}
              placeholder="Enter pincode..."
              maxLength={6}
              className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <button
              onClick={addPincode}
              disabled={!newPincode.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {rules.supportedPincodes.map((pincode) => (
            <span
              key={pincode}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
            >
              {pincode}
              {!isViewOnly && (
                <button
                  onClick={() => removePincode(pincode)}
                  className="rounded-full p-0.5 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {rules.supportedPincodes.length === 0 && (
            <p className="text-sm text-gray-400">No pincodes added</p>
          )}
        </div>
      </div>

      {/* Delivery Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Max Deliveries/Slot</label>
          <input
            type="number"
            value={rules.maxDeliveriesPerSlot}
            onChange={(e) => onUpdate({ maxDeliveriesPerSlot: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Kitchen Capacity</label>
          <input
            type="number"
            value={rules.kitchenCapacity}
            onChange={(e) => onUpdate({ kitchenCapacity: parseInt(e.target.value) || 0 })}
            disabled={isViewOnly}
            min={1}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* Minimum Order Days */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Order Days</label>
        <input
          type="number"
          value={rules.minOrderDays}
          onChange={(e) => onUpdate({ minOrderDays: parseInt(e.target.value) || 1 })}
          disabled={isViewOnly}
          min={1}
          className="h-11 w-full max-w-xs rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Holiday Rules */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Holiday Rules</label>
        <textarea
          value={rules.holidayRules}
          onChange={(e) => onUpdate({ holidayRules: e.target.value })}
          disabled={isViewOnly}
          rows={3}
          placeholder="Describe holiday delivery rules..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
        />
      </div>

      {/* Blackout Dates */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Blackout Dates</label>
        <input
          type="text"
          value={rules.blackoutDates.join(", ")}
          onChange={(e) => onUpdate({ blackoutDates: e.target.value.split(",").map((d) => d.trim()).filter(Boolean) })}
          disabled={isViewOnly}
          placeholder="e.g., 2026-01-26, 2026-08-15"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <p className="mt-1 text-xs text-gray-400">Comma-separated dates (YYYY-MM-DD)</p>
      </div>

      {/* Delivery Charge Overrides */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Delivery Charge Overrides</label>
        <textarea
          value={rules.deliveryChargeOverrides}
          onChange={(e) => onUpdate({ deliveryChargeOverrides: e.target.value })}
          disabled={isViewOnly}
          rows={2}
          placeholder="Special delivery charge rules for specific areas..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
        />
      </div>
    </div>
  );
}
