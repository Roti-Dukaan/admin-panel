"use client";

import { useState } from "react";
import { SubscriptionPlan, PlanBenefit } from "@/features/subscription-plans/types/subscription-plan";
import { GripVertical, Plus, X } from "lucide-react";

interface BenefitsTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (benefits: PlanBenefit[]) => void;
}

const SUGGESTED_BENEFITS = [
  "Fresh Homemade Food",
  "High Protein",
  "No Preservatives",
  "High Fibre",
  "Healthy Lifestyle",
  "Freshly Cooked Daily",
  "Doorstep Delivery",
  "Premium Ingredients",
  "Calorie Controlled",
  "Bulk Discounts",
  "Customizable Menu",
  "Family Friendly",
  "Kids Friendly",
  "Vegan Options",
  "Gluten Free",
];

export function BenefitsTab({ plan, isViewOnly, onUpdate }: BenefitsTabProps) {
  const [newBenefit, setNewBenefit] = useState("");
  const benefits = plan.benefits;

  const addBenefit = (text: string) => {
    if (isViewOnly || !text.trim()) return;
    const newBen: PlanBenefit = {
      id: `ben-${Date.now()}`,
      text: text.trim(),
      order: benefits.length,
    };
    onUpdate([...benefits, newBen]);
    setNewBenefit("");
  };

  const removeBenefit = (id: string) => {
    if (isViewOnly) return;
    onUpdate(benefits.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })));
  };

  const moveBenefit = (fromIndex: number, direction: "up" | "down") => {
    if (isViewOnly) return;
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= benefits.length) return;
    const updated = [...benefits];
    [updated[fromIndex], updated[toIndex]] = [updated[toIndex], updated[fromIndex]];
    onUpdate(updated.map((b, i) => ({ ...b, order: i })));
  };

  return (
    <div className="space-y-8">
      {/* Current Benefits */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Plan Benefits
          <span className="ml-2 text-xs font-normal text-gray-400">({benefits.length} benefits)</span>
        </label>
        {benefits.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">No benefits added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                {!isViewOnly && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveBenefit(index, "up")}
                      disabled={index === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
                    >
                      <GripVertical className="h-3 w-3 rotate-180" />
                    </button>
                    <button
                      onClick={() => moveBenefit(index, "down")}
                      disabled={index === benefits.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <span className="text-lg">{benefit.icon || "✨"}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{benefit.text}</span>
                {!isViewOnly && (
                  <button
                    onClick={() => removeBenefit(benefit.id)}
                    className="rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Benefit */}
      {!isViewOnly && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Add Benefit</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBenefit(newBenefit)}
              placeholder="Type a benefit..."
              className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <button
              onClick={() => addBenefit(newBenefit)}
              disabled={!newBenefit.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      )}

      {/* Suggested Benefits */}
      {!isViewOnly && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Suggested Benefits
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_BENEFITS.filter(
              (s) => !benefits.some((b) => b.text === s)
            ).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addBenefit(suggestion)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <Plus className="h-3 w-3" /> {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {benefits.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Preview
          </label>
          <div className="flex flex-wrap gap-2">
            {benefits.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
              >
                {b.icon || "✨"} {b.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
