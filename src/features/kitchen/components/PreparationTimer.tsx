"use client";

import { Clock } from "lucide-react";
import { getTimerDisplay } from "../hooks/usePrepClock";
import type { KitchenOrderView } from "../types/kitchen";

export function PreparationTimer({
  order,
  now,
  size = "md",
}: {
  order: KitchenOrderView;
  now: number;
  size?: "sm" | "md";
}) {
  const { text, colorClass } = getTimerDisplay(order, now);
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tabular-nums ${colorClass} ${textSize}`}
      title="Preparation time"
    >
      <Clock className={icon} />
      {text}
    </span>
  );
}
