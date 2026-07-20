"use client";

import { useState } from "react";
import { useOpsAnalytics } from "@/features/subscriptions/hooks/useSubscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";

export function OpsAnalyticsTab() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useOpsAnalytics(days);

  if (isLoading || !data) return <div className="py-10 text-center text-sm text-muted-foreground">Loading analytics…</div>;

  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Window</label>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Revenue" value={data.revenue} />
        <StatCard label="Meals Delivered" value={data.mealsDelivered} />
        <StatCard label="Avg Duration (days)" value={data.avgSubscriptionDurationDays} />
        <StatCard label="Churn Rate" value={parseFloat(pct(data.churnRate))} tone="warning" />
        <StatCard label="Pause Rate" value={parseFloat(pct(data.pauseRate))} />
        <StatCard label="Vacation Rate" value={parseFloat(pct(data.vacationRate))} />
        <StatCard label="Renewal Rate" value={parseFloat(pct(data.renewalRate))} tone="info" />
        <StatCard label="Retention Rate" value={parseFloat(pct(data.retentionRate))} tone="success" />
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-semibold">Subscription Growth vs Cancellations</h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.growth.map((g, i) => ({ date: g.date.slice(5), created: g.count, cancelled: data.cancellations[i]?.count ?? 0 }))}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="created" stroke="#10b981" />
              <Line dataKey="cancelled" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
