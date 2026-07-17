"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  UtensilsCrossed,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useSubscriptionAnalytics } from "../hooks/useSubscriptions";

export function SubscriptionAnalytics() {
  const { data, isLoading } = useSubscriptionAnalytics();

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-400">Loading analytics…</div>;
  }
  if (!data) {
    return <div className="py-10 text-center text-sm text-gray-400">No analytics available.</div>;
  }

  const maxMeal = Math.max(1, ...(data.meals ?? []).map((m) => m.count));
  const maxReason = Math.max(1, ...(data.pauseReasons ?? []).map((r) => r.count));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Growth */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-orange-500" /> Growth (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data.growth || data.growth.length === 0 ? (
            <p className="text-sm text-gray-400">No growth data.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex h-40 items-end gap-1">
                {data.growth.map((g) => (
                  <div key={g.date} className="group relative flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-orange-400/80"
                      style={{ height: `${Math.max(4, (g.netGrowth / Math.max(1, ...data.growth.map((x) => x.netGrowth))) * 100)}%` }}
                      title={`${g.date}: net ${g.netGrowth}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{data.growth[0]?.date}</span>
                <span>{data.growth[data.growth.length - 1]?.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 py-2">
                  <p className="text-base font-bold text-emerald-700">
                    {data.growth.reduce((s, g) => s + g.newSubscriptions, 0)}
                  </p>
                  <p className="text-[10px] uppercase text-emerald-600">New</p>
                </div>
                <div className="rounded-lg bg-red-50 py-2">
                  <p className="text-base font-bold text-red-700">
                    {data.growth.reduce((s, g) => s + g.cancelledSubscriptions, 0)}
                  </p>
                  <p className="text-[10px] uppercase text-red-600">Cancelled</p>
                </div>
                <div className="rounded-lg bg-orange-50 py-2">
                  <p className="text-base font-bold text-orange-700">
                    {data.growth[data.growth.length - 1]?.totalActive ?? 0}
                  </p>
                  <p className="text-[10px] uppercase text-orange-600">Active now</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal popularity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-5 w-5 text-violet-500" /> Meal Popularity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data.meals ?? []).map((m) => (
            <div key={m.meal}>
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700">{m.meal}</span>
                <span className="text-gray-400">{m.count}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-violet-400" style={{ width: `${(m.count / maxMeal) * 100}%` }} />
              </div>
            </div>
          ))}
          {(data.meals ?? []).length === 0 && <p className="text-sm text-gray-400">No data.</p>}
        </CardContent>
      </Card>

      {/* Pause reasons */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-5 w-5 text-amber-500" /> Pause Reasons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data.pauseReasons ?? []).map((r) => (
            <div key={r.reason} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{r.reason || "Unspecified"}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${(r.count / maxReason) * 100}%` }} />
                </div>
                <Badge variant="secondary">{r.count}</Badge>
              </div>
            </div>
          ))}
          {(data.pauseReasons ?? []).length === 0 && <p className="text-sm text-gray-400">No pauses recorded.</p>}
        </CardContent>
      </Card>

      {/* Vacation + delivery health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="h-5 w-5 text-sky-500" /> Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HealthRow label="Vacations" value={`${data.vacation?.activeNow ?? 0} active`} />
          <HealthRow label="Delivery success" value={`${Math.round((data.delivery?.successRate ?? 0) * 100)}%`} />
          <HealthRow label="Forecast accuracy" value={`${Math.round((data.forecast?.accuracy ?? 0) * 100)}%`} />
          <HealthRow label="Kitchen utilization" value={`${Math.round((data.kitchen?.utilization ?? 0) * 100)}%`} />
        </CardContent>
      </Card>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
