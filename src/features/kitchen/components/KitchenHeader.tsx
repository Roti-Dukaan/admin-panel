"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { usePrepClock } from "../hooks/usePrepClock";

export function KitchenHeader() {
  const now = usePrepClock(true);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kitchen Operations</h1>
        <p className="text-sm text-gray-500">{format(now, "EEEE, dd MMMM yyyy")}</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">Local Time</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-gray-900">
          {format(now, "hh:mm:ss a")}
        </span>
      </div>
    </div>
  );
}
