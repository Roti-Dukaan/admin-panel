"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Availability, AVAILABILITY_CONFIG } from "../types/menu";

type MenuAvailabilityToggleProps = {
  foodId: string;
  availability: Availability;
  onToggle: (id: string) => Promise<void>;
};

/** Inline enable/disable control for catalog menu rows (matches admin switch + status pill). */
export function MenuAvailabilityToggle({
  foodId,
  availability,
  onToggle,
}: MenuAvailabilityToggleProps) {
  const [pending, setPending] = useState(false);
  const isEnabled = availability === "available";
  const config = AVAILABILITY_CONFIG[availability];

  const handleChange = async (checked: boolean) => {
    if (pending) return;
    if (checked === isEnabled) return;
    setPending(true);
    try {
      await onToggle(foodId);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex shrink-0 items-center">
        <Switch
          checked={isEnabled}
          disabled={pending}
          onCheckedChange={(checked) => void handleChange(checked)}
          aria-label={isEnabled ? "Disable menu item" : "Enable menu item"}
        />
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
          </div>
        )}
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bgColor} ${config.color}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
        {config.label}
      </span>
    </div>
  );
}
