"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductionPlan, useProductionRealtime, useProductionBatches, useCanManageProduction } from "./useKitchenProduction";
import { MealSlotSection, statusBadge } from "./components/MealSlotSection";
import { BatchManager } from "./components/BatchManager";
import { FoodSummary } from "./components/FoodSummary";
import { ReportsBar } from "./components/ReportsBar";
import { ProductionTimeline } from "./components/ProductionTimeline";
import type { MealSlot } from "./types";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function KitchenProductionPage() {
  const [tab, setTab] = useState("today");
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const plan = useProductionPlan(date);
  const batches = useProductionBatches(date);
  const canManage = useCanManageProduction();
  useProductionRealtime(date);

  const summary = plan.data?.summary;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Kitchen Production"
        subtitle={`Production planning for ${date}. Auto-built from today's manual + subscription orders.`}
        actions={<ReportsBar date={date} />}
      />

      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <StatCard label="Total Orders" value={summary?.totalOrders ?? 0} hint={`${summary?.subscriptionOrders ?? 0} subscription · ${summary?.manualOrders ?? 0} manual`} />
          <StatCard label="Total Items" value={summary?.totalItems ?? 0} hint={`${summary?.totalRotis ?? 0} rotis`} />
          <StatCard label="Veg Meals" value={summary?.vegMeals ?? 0} />
          <StatCard label="Non-Veg Meals" value={summary?.nonVegMeals ?? 0} />
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="today">Today&apos;s Production</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="food">Food Summary</TabsTrigger>
            <TabsTrigger value="timeline">Production Timeline</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="today">
              {plan.isLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Loading production plan…</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {(["breakfast", "lunch", "dinner"] as MealSlot[]).map((slot) => (
                      <Card key={slot}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base capitalize">{slot}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          Orders: {summary?.byMealSlot?.[slot]?.orders ?? 0} · Items: {summary?.byMealSlot?.[slot]?.items ?? 0}
                        </CardContent>
                      </Card>
                    ))}
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
