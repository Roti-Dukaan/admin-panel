"use client";

import { motion } from "motion/react";
import { useKitchenStore } from "../hooks/useKitchen";
import { DeliverySlot, SLOT_CONFIG } from "../types/kitchen";

const slots: DeliverySlot[] = ["lunch", "dinner", "tomorrow"];

export function SlotSelector() {
  const currentSlot = useKitchenStore((s) => s.currentSlot);
  const setCurrentSlot = useKitchenStore((s) => s.setCurrentSlot);

  return (
    <div className="flex items-center gap-2">
      {slots.map((slot) => {
        const config = SLOT_CONFIG[slot];
        const isActive = currentSlot === slot;
        return (
          <button
            key={slot}
            onClick={() => setCurrentSlot(slot)}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="slot-active"
                className="absolute inset-0 rounded-lg bg-gray-900"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{config.emoji}</span>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
