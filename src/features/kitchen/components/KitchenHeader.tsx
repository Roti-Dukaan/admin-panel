"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { RefreshCw, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKitchenStore } from "../hooks/useKitchen";
import { SLOT_CONFIG } from "../types/kitchen";

export function KitchenHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentSlot = useKitchenStore((s) => s.currentSlot);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Kitchen Operations
        </h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {timeStr}
          </span>
          <span className="text-gray-300">|</span>
          <span>{dateStr}</span>
          <span className="text-gray-300">|</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            {SLOT_CONFIG[currentSlot].emoji} {SLOT_CONFIG[currentSlot].label} Slot
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" disabled className="gap-2 opacity-50">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </motion.div>
  );
}
