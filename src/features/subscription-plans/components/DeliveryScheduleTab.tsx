"use client";

import { SubscriptionPlan, DeliverySchedule, DeliveryDay, ALL_DELIVERY_DAYS, ALL_DELIVERY_SLOTS, DeliverySlot, DayPreset } from "@/features/subscription-plans/types/subscription-plan";

interface DeliveryScheduleTabProps {
  plan: SubscriptionPlan;
  isViewOnly: boolean;
  onUpdate: (data: Partial<DeliverySchedule>) => void;
}

const DAY_LABELS: Record<DeliveryDay, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const PRESET_OPTIONS: { value: DayPreset; label: string; description: string }[] = [
  { value: "weekdays", label: "Weekdays Only", description: "Mon - Fri" },
  { value: "weekends", label: "Weekends Only", description: "Sat - Sun" },
  { value: "everyday", label: "Everyday", description: "Mon - Sun" },
  { value: "custom", label: "Custom", description: "Pick your days" },
];

export function DeliveryScheduleTab({ plan, isViewOnly, onUpdate }: DeliveryScheduleTabProps) {
  const delivery = plan.delivery;

  const toggleDay = (day: DeliveryDay) => {
    if (isViewOnly) return;
    const current = delivery.deliveryDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onUpdate({ deliveryDays: updated, dayPreset: "custom" });
  };

  const applyPreset = (preset: DayPreset) => {
    if (isViewOnly) return;
    let days: DeliveryDay[];
    switch (preset) {
      case "weekdays":
        days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        break;
      case "weekends":
        days = ["saturday", "sunday"];
        break;
      case "everyday":
        days = [...ALL_DELIVERY_DAYS];
        break;
      default:
        days = delivery.deliveryDays;
    }
    onUpdate({ deliveryDays: days, dayPreset: preset });
  };

  const toggleSlot = (slot: DeliverySlot) => {
    if (isViewOnly) return;
    const current = delivery.deliverySlots;
    const updated = current.includes(slot)
      ? current.filter((s) => s !== slot)
      : [...current, slot];
    onUpdate({ deliverySlots: updated });
  };

  return (
    <div className="space-y-8">
      {/* Day Presets */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Quick Presets</label>
        <div className="grid grid-cols-2 gap-3">
          {PRESET_OPTIONS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => applyPreset(preset.value)}
              disabled={isViewOnly}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                delivery.dayPreset === preset.value
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <p className="text-sm font-semibold">{preset.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Days */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Days</label>
        <div className="flex gap-2">
          {ALL_DELIVERY_DAYS.map((day) => {
            const active = delivery.deliveryDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                disabled={isViewOnly}
                className={`h-12 flex-1 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {delivery.deliveryDays.length} day(s) selected
        </p>
      </div>

      {/* Delivery Slots */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Slots</label>
        <div className="space-y-2">
          {ALL_DELIVERY_SLOTS.map((slot) => {
            const active = delivery.deliverySlots.includes(slot.key);
            return (
              <button
                key={slot.key}
                onClick={() => toggleSlot(slot.key)}
                disabled={isViewOnly}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  active
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${isViewOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                      active ? "border-orange-500 bg-orange-500" : "border-gray-300"
                    }`}
                  >
                    {active && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{slot.label}</span>
                </div>
                <span className="text-sm text-gray-500">{slot.time}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
