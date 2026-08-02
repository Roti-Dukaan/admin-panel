"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChefHat, Truck, CalendarDays, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionForecast } from "../hooks/useSubscriptions";
import type { KitchenForecast, DeliveryForecast } from "../types/subscription";

import { tomorrowDateKey } from "@/lib/date";

export function ForecastPanel() {
  const [date, setDate] = useState(tomorrowDateKey());
  const { data, isLoading, refetch, isFetching } = useSubscriptionForecast(date);

  const kitchen: KitchenForecast | null = data?.kitchen ?? null;
  const delivery: DeliveryForecast | null = data?.delivery ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Production & Delivery Forecast</h2>
          <p className="text-sm text-gray-500">Kitchen load and rider demand for the selected date.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kitchen Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChefHat className="h-5 w-5 text-teal-600" /> Kitchen Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : !kitchen ? (
              <p className="text-sm text-gray-400">No forecast generated yet for this date.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Metric label="Orders" value={String(kitchen.totalOrders)} />
                  <Metric label="Quantity" value={String(kitchen.totalQuantity)} />
                  <Metric label="Prep (min)" value={String(kitchen.estimatedPrepMinutes)} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-400">By Meal</p>
                  <div className="space-y-1.5">
                    {Object.entries(kitchen.byMeal ?? {}).map(([meal, v]) => (
                      <div key={meal} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                        <span className="capitalize text-gray-700">{meal}</span>
                        <span className="text-gray-500">
                          {v.orders} orders · {v.quantity} qty
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Top Items</p>
                  <div className="space-y-1.5">
                    {(kitchen.byItem ?? []).slice(0, 5).map((it) => (
                      <div key={it.foodItemId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{it.name}</span>
                        <Badge variant="secondary">{it.quantity} qty</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400">Confidence: {Math.round((kitchen.confidence ?? 0) * 100)}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-sky-500" /> Delivery Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : !delivery ? (
              <p className="text-sm text-gray-400">No forecast generated yet for this date.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Metric label="Deliveries" value={String(delivery.totalDeliveries)} />
                  <Metric label="Riders" value={String(delivery.estimatedRiders)} />
                  <Metric label="Dist (km)" value={String(delivery.estimatedDistanceKm)} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-400">By Slot</p>
                  <div className="space-y-1.5">
                    {(delivery.bySlot ?? []).map((s) => (
                      <div key={s.deliverySlotId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                        <span className="text-gray-700">{s.name}</span>
                        <span className="text-gray-500">
                          {s.deliveries} deliveries · {s.quantity} qty
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {delivery.byZone && delivery.byZone.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-400">By Zone</p>
                    <div className="space-y-1.5">
                      {delivery.byZone.map((z) => (
                        <div key={z.zone} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{z.zone}</span>
                          <Badge variant="outline">{z.deliveries}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400">Confidence: {Math.round((delivery.confidence ?? 0) * 100)}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gray-50 py-3">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
    </motion.div>
  );
}
