"use client";

import {
  Layers,
  CheckCircle2,
  PauseCircle,
  Plane,
  XCircle,
  Timer,
  CalendarClock,
  CalendarDays,
  RefreshCw,
  ShoppingBag,
  Package,
  TrendingUp,
} from "lucide-react";
import { useOpsDashboard } from "@/features/subscriptions/hooks/useSubscriptions";
import { StatCard } from "./StatCard";
import { AlertBanner } from "./AlertBanner";

export function OpsDashboardTab() {
  const { data, isLoading } = useOpsDashboard();

  if (isLoading || !data) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-5">
      <AlertBanner />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Subscriptions" value={data.total} icon={Layers} />
        <StatCard label="Active" value={data.active} tone="success" icon={CheckCircle2} />
        <StatCard label="Paused" value={data.paused} tone="warning" icon={PauseCircle} />
        <StatCard label="On Vacation" value={data.onVacation} tone="info" icon={Plane} />
        <StatCard label="Cancelled" value={data.cancelled} tone="destructive" icon={XCircle} />
        <StatCard label="Expired" value={data.expired} icon={Timer} />
        <StatCard label="Expiring Today" value={data.expiringToday} tone="warning" icon={CalendarClock} />
        <StatCard label="Expiring This Week" value={data.expiringThisWeek} tone="warning" icon={CalendarDays} />
        <StatCard label="Renewals Due" value={data.renewalsDue} tone="info" icon={RefreshCw} />
        <StatCard label="Today's Orders" value={data.todayOrders} icon={ShoppingBag} />
        <StatCard label="Tomorrow's Orders" value={data.tomorrowOrders} icon={Package} />
        <StatCard label="This Week Meals" value={data.thisWeekForecast.totalMeals} icon={TrendingUp} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">This Week Forecast</h3>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Meals</th>
                <th className="px-3 py-2 text-right">Deliveries</th>
                <th className="px-3 py-2 w-40">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {data.thisWeekForecast.byDay.map((d) => {
                const pct = Math.min(100, d.utilizationPct);
                return (
                  <tr key={d.date} className="border-t border-border last:border-0 hover:bg-muted/40">
                    <td className="px-3 py-2 font-medium text-foreground">{d.date}</td>
                    <td className="px-3 py-2 text-right">{d.totalMeals}</td>
                    <td className="px-3 py-2 text-right">{d.expectedDeliveries}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? "bg-amber-500" : "bg-teal-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${pct >= 90 ? "text-amber-600" : "text-foreground"}`}>
                          {d.utilizationPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
