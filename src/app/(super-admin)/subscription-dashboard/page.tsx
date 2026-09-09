"use client";

import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CalendarCheck,
  ChefHat,
  CheckCircle2,
  Clock,
  PauseCircle,
  RefreshCw,
  Truck,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionOverview } from "@/features/subscriptions/hooks/useSubscriptions";
import type { SubscriptionStatusKey } from "@/features/subscriptions/services/subscription-overview.api";

const STATUS_CARDS: {
  key: SubscriptionStatusKey;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { key: "ACTIVE", label: "Active", icon: Users, color: "bg-emerald-100 text-emerald-600" },
  { key: "PENDING", label: "Pending", icon: Clock, color: "bg-sky-100 text-sky-600" },
  { key: "PAUSED", label: "Paused", icon: PauseCircle, color: "bg-amber-100 text-amber-600" },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "bg-violet-100 text-violet-600" },
  { key: "EXPIRED", label: "Expired", icon: CalendarCheck, color: "bg-gray-100 text-gray-600" },
  { key: "CANCELLED", label: "Cancelled", icon: Ban, color: "bg-red-100 text-red-600" },
];

const QUICK_LINKS = [
  { label: "Plans", href: "/subscription-plans", description: "Pricing, categories and cut-off rules" },
  { label: "Subscribers", href: "/subscriptions", description: "Customer subscriptions and lifecycle" },
  { label: "Deliveries", href: "/subscription-operations", description: "Production ops and daily planning" },
  { label: "Production", href: "/admin/subscription-production", description: "Kitchen cooking sheet" },
];

function StatTile({
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
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default function SubscriptionDashboardPage() {
  const { data, isLoading, isFetching, refetch } = useSubscriptionOverview();

  const kitchen = data?.kitchen;
  const delivery = data?.delivery;
  const topItems = (kitchen?.itemTotals ?? [])
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);
  const maxItemQty = Math.max(1, ...topItems.map((i) => i.quantity));

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscriptions Dashboard"
        subtitle="Subscriber base, today's kitchen load and delivery progress"
        actions={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="space-y-6 p-6">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading dashboard…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {STATUS_CARDS.map((card) => (
                <StatTile
                  key={card.key}
                  icon={card.icon}
                  label={card.label}
                  value={String(data?.statusCounts[card.key] ?? 0)}
                  color={card.color}
                />
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ChefHat className="h-5 w-5 text-orange-500" /> Today&apos;s Kitchen Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!kitchen ? (
                    <p className="text-sm text-gray-400">No kitchen data for today.</p>
                  ) : (
                    <>
                      <CountRow label="Deliveries" value={kitchen.totalDeliveries} />
                      <CountRow label="Customers" value={kitchen.totalCustomers} />
                      <CountRow label="Rotis" value={kitchen.totalRotis} />
                      <CountRow label="Packs" value={kitchen.totalPacks} />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-violet-500" /> Preparation Stages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!kitchen ? (
                    <p className="text-sm text-gray-400">No preparation data for today.</p>
                  ) : (
                    <>
                      <CountRow label="Pending" value={kitchen.statusCounts.pending} />
                      <CountRow label="Preparing" value={kitchen.statusCounts.preparing} />
                      <CountRow label="Packed" value={kitchen.statusCounts.packed} />
                      <CountRow label="Ready for dispatch" value={kitchen.statusCounts.readyForDispatch} />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="h-5 w-5 text-emerald-500" /> Delivery Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!delivery ? (
                    <p className="text-sm text-gray-400">No delivery data for today.</p>
                  ) : (
                    <>
                      <CountRow label="Pending prep" value={delivery.pendingPrep} />
                      <CountRow label="Assigned" value={delivery.assigned} />
                      <CountRow label="Out for delivery" value={delivery.outForDelivery} />
                      <CountRow label="Delivered" value={delivery.delivered} />
                      <CountRow label="Failed" value={delivery.failed} />
                      <CountRow label="Cancelled / skipped" value={delivery.cancelledSkipped} />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today&apos;s Item Totals</CardTitle>
              </CardHeader>
              <CardContent>
                {topItems.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No locked deliveries for today, so there is nothing to cook yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topItems.map((item) => (
                      <div key={item.subscriptionMenuItemId}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-semibold text-gray-900">{item.quantity}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-orange-400"
                            style={{ width: `${(item.quantity / maxItemQty) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{link.description}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
