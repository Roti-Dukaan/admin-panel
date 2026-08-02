"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ClipboardList,
  ShoppingBag,
  Wheat,
  Salad,
  Drumstick,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProductionPlan, useProductionRealtime, useProductionBatches, useCanManageProduction } from "./useKitchenProduction";
import { MealSlotSection, statusBadge } from "./components/MealSlotSection";
import { BatchManager } from "./components/BatchManager";
import { FoodSummary } from "./components/FoodSummary";
import { ReportsBar } from "./components/ReportsBar";
import { ProductionTimeline } from "./components/ProductionTimeline";
import type { MealSlot } from "./types";
import { todayDateKey } from "@/lib/date";

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  tint: "teal" | "amber" | "emerald" | "rose";
}) {
  const tintMap = {
    teal: "bg-teal-50 text-teal-600 ring-teal-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  } as const;
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${tintMap[tint]}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold leading-none text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function KitchenProductionPage() {
  const [tab, setTab] = useState("today");
  const [date] = useState(todayDateKey());
  const plan = useProductionPlan(date);
  const batches = useProductionBatches(date);
  const canManage = useCanManageProduction();
  useProductionRealtime(date);

  const summary = plan.data?.summary;
  const slotMeta: { slot: MealSlot; icon: React.ElementType; tint: "amber" | "teal" | "rose" }[] = [
    { slot: "breakfast", icon: CalendarDays, tint: "amber" },
    { slot: "lunch", icon: Salad, tint: "teal" },
    { slot: "dinner", icon: Drumstick, tint: "rose" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Kitchen Production"
        actions={<ReportsBar date={date} />}
      />

      <div className="p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Production planning for {date}. Auto-built from today&apos;s manual + subscription orders.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <StatTile
            label="Total Orders"
            value={summary?.totalOrders ?? 0}
            hint={`${summary?.subscriptionOrders ?? 0} subscription · ${summary?.manualOrders ?? 0} manual`}
            icon={ShoppingBag}
            tint="teal"
          />
          <StatTile
            label="Total Items"
            value={summary?.totalItems ?? 0}
            hint={`${summary?.totalRotis ?? 0} rotis`}
            icon={Wheat}
            tint="amber"
          />
          <StatTile
            label="Veg Meals"
            value={summary?.vegMeals ?? 0}
            icon={Salad}
            tint="emerald"
          />
          <StatTile
            label="Non-Veg Meals"
            value={summary?.nonVegMeals ?? 0}
            icon={Drumstick}
            tint="rose"
          />
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="today" className="gap-1.5">
              <ClipboardList className="h-4 w-4" /> Today&apos;s Production
            </TabsTrigger>
            <TabsTrigger value="batches" className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> Batches
            </TabsTrigger>
            <TabsTrigger value="food" className="gap-1.5">
              <Wheat className="h-4 w-4" /> Food Summary
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <CalendarDays className="h-4 w-4" /> Production Timeline
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="today">
              {plan.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading production plan…
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {slotMeta.map(({ slot, icon: Icon, tint }) => {
                      const data = summary?.byMealSlot?.[slot];
                      const tintRing = {
                        amber: "bg-amber-50 text-amber-600 ring-amber-100",
                        teal: "bg-teal-50 text-teal-600 ring-teal-100",
                        rose: "bg-rose-50 text-rose-600 ring-rose-100",
                      } as const;
                      return (
                        <Card key={slot}>
                          <CardContent className="flex items-center gap-4 p-5">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tintRing[tint]}`}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold capitalize text-foreground">{slot}</p>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{data?.orders ?? 0}</span> orders ·{" "}
                                <span className="font-semibold text-foreground">{data?.items ?? 0}</span> items
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {(["breakfast", "lunch", "dinner"] as MealSlot[]).map((slot) => (
                      <MealSlotSection key={slot} slot={slot} items={plan.data?.bySlot?.[slot] ?? []} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="batches">
              <BatchManager date={date} batches={batches.data ?? []} canManage={canManage} />
            </TabsContent>

            <TabsContent value="food">
              <FoodSummary plan={plan.data} />
            </TabsContent>

            <TabsContent value="timeline">
              <ProductionTimeline batches={batches.data ?? []} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
