"use client";

import { useEffect, useState } from "react";

/**
 * Returns a `now` timestamp that updates every second while `active`.
 * Drives the live preparation timers across the board without re-fetching.
 */
export function usePrepClock(active = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  return now;
}

export function elapsedSeconds(orderCreatedAt: string, now: number): number {
  const created = new Date(orderCreatedAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((now - created) / 1000));
}

export function formatPrepClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/** Color thresholds: 0–10 green, 10–20 orange, 20+ red. */
export function timerColorClass(orderCreatedAt: string, now: number): string {
  const minutes = elapsedSeconds(orderCreatedAt, now) / 60;
  if (minutes <= 10) return "text-emerald-600";
  if (minutes <= 20) return "text-amber-600";
  return "text-red-600";
}

/**
 * Compute the timer text + color for a board card based on the order stage.
 * PREPARING shows time since prep started; READY shows the prep duration;
 * PENDING shows time waiting since the order was placed.
 */
export function getTimerDisplay(
  order: { kitchenStatus: string; orderCreatedAt: string; startedPreparingAt?: string; timer: { readyDurationMinutes: number | null } },
  now: number
): { text: string; colorClass: string } {
  const elapsedSec = elapsedSeconds(order.orderCreatedAt, now);
  const color = timerColorClass(order.orderCreatedAt, now);

  if (order.kitchenStatus === "PREPARING" && order.startedPreparingAt) {
    const prepSec = Math.max(0, Math.floor((now - new Date(order.startedPreparingAt).getTime()) / 1000));
    return { text: formatPrepClock(prepSec), colorClass: color };
  }

  if (order.kitchenStatus === "READY_FOR_PICKUP") {
    if (order.timer.readyDurationMinutes != null) {
      return { text: formatPrepClock(order.timer.readyDurationMinutes * 60), colorClass: "text-emerald-600" };
    }
    if (order.startedPreparingAt) {
      const prepSec = Math.max(0, Math.floor((now - new Date(order.startedPreparingAt).getTime()) / 1000));
      return { text: formatPrepClock(prepSec), colorClass: "text-emerald-600" };
    }
    return { text: formatPrepClock(elapsedSec), colorClass: color };
  }

  return { text: formatPrepClock(elapsedSec), colorClass: color };
}
