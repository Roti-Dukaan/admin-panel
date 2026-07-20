"use client";

import { useState } from "react";
import { useOpsCalendar } from "@/features/subscriptions/hooks/useSubscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Day {
  date: string;
  newSubscriptions: number;
  expiring: number;
  paused: number;
  vacation: number;
  renewals: number;
  skipped: number;
  kitchenLoad: number;
}

function intensityClass(v: number) {
  if (v === 0) return "bg-muted/30";
  if (v < 5) return "bg-emerald-100";
  if (v < 15) return "bg-emerald-300";
  if (v < 30) return "bg-emerald-500 text-white";
  return "bg-emerald-700 text-white";
}

export function OpsCalendarTab() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const { data, isLoading } = useOpsCalendar(year, month);

  const days = data?.days ?? [];
  const byDate = new Map<string, Day>(days.map((d) => [d.date, d]));
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (Day | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(byDate.get(key) ?? { date: key, newSubscriptions: 0, expiring: 0, paused: 0, vacation: 0, renewals: 0, skipped: 0, kitchenLoad: 0 });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => shiftMonth(-1)}>Prev</Button>
          <span className="text-sm font-semibold">
            {new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </span>
          <Button size="sm" variant="outline" onClick={() => shiftMonth(1)}>Next</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Loading calendar…</div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1 font-medium">{d}</div>
          ))}
          {cells.map((day, i) => (
            <CalendarCell key={i} day={day} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend color="bg-emerald-100" label="New" />
        <Legend color="bg-amber-200" label="Paused" />
        <Legend color="bg-sky-200" label="Vacation" />
        <Legend color="bg-red-200" label="Expiring" />
        <Legend color="bg-violet-200" label="Renewals" />
        <Legend color="bg-gray-300" label="Skipped" />
      </div>
    </div>
  );

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
  }
}

function CalendarCell({ day }: { day: Day | null }) {
  if (!day) return <div />;
  const total = day.kitchenLoad;
  return (
    <div className={`min-h-[64px] rounded-md border border-border p-1 text-left ${intensityClass(total)}`}>
      <div className="text-[11px] font-semibold">{day.date.slice(8)}</div>
      <div className="mt-0.5 space-y-0.5 text-[10px]">
        {day.newSubscriptions > 0 && <Pill color="bg-emerald-200" label={`+${day.newSubscriptions}`} />}
        {day.expiring > 0 && <Pill color="bg-red-200" label={`exp ${day.expiring}`} />}
        {day.paused > 0 && <Pill color="bg-amber-200" label={`p ${day.paused}`} />}
        {day.vacation > 0 && <Pill color="bg-sky-200" label={`v ${day.vacation}`} />}
        {day.renewals > 0 && <Pill color="bg-violet-200" label={`r ${day.renewals}`} />}
        {day.skipped > 0 && <Pill color="bg-gray-300" label={`s ${day.skipped}`} />}
        {day.kitchenLoad > 0 && <div className="text-[10px] font-medium">⚙ {day.kitchenLoad}</div>}
      </div>
    </div>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return <span className={`inline-block rounded px-1 ${color}`}>{label}</span>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block size-3 rounded ${color}`} /> {label}
    </span>
  );
}
