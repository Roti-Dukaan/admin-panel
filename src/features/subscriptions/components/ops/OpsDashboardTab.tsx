"use client";

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
        <StatCard label="Total Subscriptions" value={data.total} />
        <StatCard label="Active" value={data.active} tone="success" />
        <StatCard label="Paused" value={data.paused} tone="warning" />
        <StatCard label="On Vacation" value={data.onVacation} tone="info" />
        <StatCard label="Cancelled" value={data.cancelled} tone="destructive" />
        <StatCard label="Expired" value={data.expired} />
        <StatCard label="Expiring Today" value={data.expiringToday} tone="warning" />
        <StatCard label="Expiring This Week" value={data.expiringThisWeek} tone="warning" />
        <StatCard label="Renewals Due" value={data.renewalsDue} tone="info" />
        <StatCard label="Today's Orders" value={data.todayOrders} />
        <StatCard label="Tomorrow's Orders" value={data.tomorrowOrders} />
        <StatCard label="This Week Meals" value={data.thisWeekForecast.totalMeals} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">This Week Forecast</h3>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Meals</th>
                <th className="px-3 py-2">Deliveries</th>
                <th className="px-3 py-2">Utilization %</th>
              </tr>
            </thead>
            <tbody>
              {data.thisWeekForecast.byDay.map((d) => (
                <tr key={d.date} className="border-t border-border">
                  <td className="px-3 py-2">{d.date}</td>
                  <td className="px-3 py-2">{d.totalMeals}</td>
                  <td className="px-3 py-2">{d.expectedDeliveries}</td>
                  <td className="px-3 py-2">{d.utilizationPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
