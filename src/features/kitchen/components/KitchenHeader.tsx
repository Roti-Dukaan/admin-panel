"use client";

import { Clock, Wifi, WifiOff } from "lucide-react";
import { formatInIst, formatIstTime } from "@/lib/date";
import { usePrepClock } from "../hooks/usePrepClock";

export function KitchenHeader({ connected = false }: { connected?: boolean }) {
  const now = usePrepClock(true);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kitchen Operations</h1>
        <p className="text-sm text-gray-500">
          {formatInIst(now, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            connected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
          title={connected ? "Live updates connected" : "Reconnecting…"}
        >
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? "Live" : "Offline"}
        </span>
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">IST</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-gray-900">
          {formatIstTime(now, true)}
        </span>
      </div>
    </div>
  );
}
