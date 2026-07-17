"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PauseCircle, Plane, Ban, DollarSign, TrendingUp } from "lucide-react";
import type { SubscriptionAnalyticsOverview } from "../types/subscription";

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionAnalyticsCards({ overview }: { overview: SubscriptionAnalyticsOverview }) {
  const inr = (n: number) =>
    `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Stat icon={Users} label="Active" value={String(overview.totalActive)} color="bg-emerald-100 text-emerald-600" />
      <Stat icon={PauseCircle} label="Paused" value={String(overview.totalPaused)} color="bg-amber-100 text-amber-600" />
      <Stat icon={Plane} label="Vacation" value={String(overview.totalOnVacation)} color="bg-sky-100 text-sky-600" />
      <Stat icon={Ban} label="Cancelled" value={String(overview.totalCancelled)} color="bg-red-100 text-red-600" />
      <Stat icon={DollarSign} label="MRR" value={inr(overview.mrr)} color="bg-violet-100 text-violet-600" />
      <Stat icon={TrendingUp} label="Renewal" value={`${Math.round(overview.renewalRate * 100)}%`} color="bg-orange-100 text-orange-600" />
    </div>
  );
}
