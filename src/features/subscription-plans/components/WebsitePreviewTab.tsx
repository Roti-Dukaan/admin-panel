"use client";

import { useState } from "react";
import { SubscriptionPlan } from "@/features/subscription-plans/types/subscription-plan";
import { Monitor, Smartphone } from "lucide-react";

interface WebsitePreviewTabProps {
  plan: SubscriptionPlan;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function WebsitePreviewTab({ plan }: WebsitePreviewTabProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const p = plan.pricing;
  const displayPrice = p.offerPrice > 0 ? p.offerPrice : p.monthlyPrice;

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setViewMode("desktop")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              viewMode === "desktop"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Monitor className="h-4 w-4" /> Desktop
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              viewMode === "mobile"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone className="h-4 w-4" /> Mobile
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          className={`bg-gray-100 rounded-2xl p-6 transition-all duration-300 ${
            viewMode === "mobile" ? "w-[375px]" : "w-full max-w-lg"
          }`}
        >
          {/* Plan Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Badge */}
            {plan.planBadge && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {plan.planBadge}
                </span>
              </div>
            )}

            {/* Card Body */}
            <div className="p-6">
              {/* Plan Name */}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.shortDescription}</p>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">
                  {formatCurrency(displayPrice)}
                </span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              {p.strikePrice > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through">{formatCurrency(p.strikePrice)}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Save {Math.round(((p.strikePrice - displayPrice) / p.strikePrice) * 100)}%
                  </span>
                </div>
              )}
              {p.freeDelivery && (
                <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  Free Delivery
                </span>
              )}

              {/* Benefits */}
              {plan.benefits.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {plan.benefits.slice(0, 5).map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
                    >
                      {b.icon} {b.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Meals Included */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  What&apos;s Included
                </p>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span>
                    {plan.meals.mealsAvailable.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span>
                    {plan.meals.rotisPerMeal} rotis per meal, {plan.meals.curriesIncluded} curry{plan.meals.curriesIncluded > 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span>
                    Delivery on {plan.delivery.deliveryDays.length} day(s)/week
                  </div>
                  {plan.menu.vegCurries.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">✓</span>
                      {plan.menu.vegCurries.length + plan.menu.nonVeg.length} items to choose from
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Days */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Delivery Days
                </p>
                <div className="flex gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const dayKey = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][i];
                    const active = plan.delivery.deliveryDays.includes(dayKey as never);
                    return (
                      <div
                        key={day}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
                          active
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Slots */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Delivery Slots
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.delivery.deliverySlots.map((slot) => {
                    const labels: Record<string, string> = {
                      breakfast: "🌅 Breakfast",
                      lunch: "☀️ Lunch",
                      evening: "🌆 Evening",
                      dinner: "🌙 Dinner",
                    };
                    return (
                      <span
                        key={slot}
                        className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {labels[slot] || slot}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
