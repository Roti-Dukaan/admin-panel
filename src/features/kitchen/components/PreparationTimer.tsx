"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface PreparationTimerProps {
  startedAt: number | null;
  estimatedMinutes: number;
  status: string;
}

export function PreparationTimer({ startedAt, estimatedMinutes, status }: PreparationTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (status !== "preparing" || !startedAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, [startedAt, status]);

  if (!startedAt) {
    return (
      <div className="text-xs text-gray-400">
        Est. {estimatedMinutes} min
      </div>
    );
  }

  const elapsed = Math.floor((Date.now() - startedAt) / 60000);
  const remaining = Math.max(estimatedMinutes - elapsed, 0);
  const isOverdue = elapsed > estimatedMinutes;

  if (status === "ready" || status === "packed" || status === "dispatched") {
    return (
      <div className="text-xs text-emerald-600 font-medium">Done</div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={isOverdue ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`h-1.5 w-1.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-amber-400"}`}
        />
        <span className={`text-xs font-semibold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
          {elapsed} min ago
        </span>
      </div>
      <span className={`text-xs ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
        {isOverdue ? `${elapsed - estimatedMinutes} min overdue` : `~${remaining} min left`}
      </span>
    </div>
  );
}
