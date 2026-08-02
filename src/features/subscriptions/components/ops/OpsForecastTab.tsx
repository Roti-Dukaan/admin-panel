"use client";

import { useState } from "react";
import {
  useOpsKitchenForecast,
  useOpsDeliveryForecast,
  useOpsKitchenRange,
} from "@/features/subscriptions/hooks/useSubscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "./StatCard";
import { KitchenRotiSummaryPanel } from "./KitchenRotiSummaryPanel";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { addDaysIst, todayDateKey } from "@/lib/date";

const SLOT_COLORS: Record<string, string> = {
  breakfast: "#f59e0b",
  lunch: "#10b981",
  dinner: "#6366f1",
};

export function OpsForecastTab() {
  const [date, setDate] = useState(todayDateKey());
  const [range] = useState({
    from: todayDateKey(),
    to: addDaysIst(new Date(), 6),
  });
  const [tab, setTab] = useState("kitchen");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <TabsList className="flex w-full gap-1 bg-transparent p-0">
          <TabsTrigger value="kitchen" className="flex-1 rounded-lg py-2 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md">Kitchen Forecast</TabsTrigger>
          <TabsTrigger value="delivery" className="flex-1 rounded-lg py-2 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md">Delivery Forecast</TabsTrigger>
          <TabsTrigger value="week" className="flex-1 rounded-lg py-2 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md">7-Day Trend</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="kitchen">
        <KitchenForecast date={date} onDate={setDate} />
      </TabsContent>
      <TabsContent value="delivery">
        <DeliveryForecast date={date} onDate={setDate} />
      </TabsContent>
      <TabsContent value="week">
        <WeekTrend from={range.from} to={range.to} />
      </TabsContent>
    </Tabs>
  );
}

function KitchenForecast({ date, onDate }: { date: string; onDate: (d: string) => void }) {
  const { data, isLoading } = useOpsKitchenForecast(date);
  if (isLoading || !data) return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>;
  const slotData = Object.entries(data.mealsBySlot).map(([slot, n]) => ({ slot, meals: n }));
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDate(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Meals" value={data.totalMeals} />
        <StatCard label="Expected Deliveries" value={data.expectedDeliveries} />
        <StatCard label="Kitchen Capacity" value={data.kitchenCapacity} />
        <StatCard label="Utilization %" value={data.utilizationPct} tone={data.utilizationPct >= 90 ? "warning" : "success"} />
      </div>
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-semibold">Meals by Slot</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={slotData}>
              <XAxis dataKey="slot" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="meals" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Rotis" value={data.meals.totalRotis} />
        <StatCard label="Veg Meals" value={data.meals.vegMeals} tone="success" />
        <StatCard label="Non-Veg Meals" value={data.meals.nonVegMeals} tone="warning" />
        <StatCard label="Special Meals" value={data.meals.specialMeals} tone="info" />
      </div>
      <KitchenRotiSummaryPanel date={date} />
    </div>
  );
}

function DeliveryForecast({ date, onDate }: { date: string; onDate: (d: string) => void }) {
  const { data, isLoading } = useOpsDeliveryForecast(date);
  if (isLoading || !data) return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>;
  const slotData = Object.entries(data.bySlot).map(([slot, n]) => ({ slot, deliveries: n }));
  const zoneData: { deliveries: number; [k: string]: any }[] = Object.entries(data.byZone).map(([zone, n]) => ({ zone, deliveries: n }));
  const pincodeData: { deliveries: number; [k: string]: any }[] = Object.entries(data.byPincode).map(([pincode, n]) => ({ pincode, deliveries: n })).slice(0, 15);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDate(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Deliveries" value={data.totalDeliveries} />
        <StatCard label="Capacity %" value={data.capacityPct} />
      </div>
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-semibold">Delivery Slot Distribution</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={slotData}>
              <XAxis dataKey="slot" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deliveries" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 text-sm font-semibold">Zone Distribution</h4>
            <DistributionTable rows={zoneData} label="Zone" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 text-sm font-semibold">Pincode Distribution</h4>
            <DistributionTable rows={pincodeData} label="Pincode" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-semibold">Provider Distribution</h4>
          <DistributionTable rows={Object.entries(data.byProvider).map(([k, n]) => ({ Zone: k, deliveries: n })) as { deliveries: number; [k: string]: any }[]} label="Provider" />
        </CardContent>
      </Card>
    </div>
  );
}

function DistributionTable({ rows, label }: { rows: { deliveries: number; [k: string]: any }[]; label: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No data.</p>;
  const key = Object.keys(rows[0]).find((k) => k !== "deliveries")!;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-muted-foreground">
        <tr>
          <th className="py-1">{label}</th>
          <th className="py-1 text-right">Deliveries</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[key]} className="border-t border-border">
            <td className="py-1">{String(r[key])}</td>
            <td className="py-1 text-right">{r.deliveries}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeekTrend({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useOpsKitchenRange(from, to);
  if (isLoading || !data) return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>;
  const chart = data.map((d) => ({
    date: d.date.slice(5),
    meals: d.totalMeals,
    deliveries: d.expectedDeliveries,
    utilization: d.utilizationPct,
  }));
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="mb-2 text-sm font-semibold">Meals vs Deliveries — next 7 days</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="meals" fill="#6366f1" />
            <Bar dataKey="deliveries" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
