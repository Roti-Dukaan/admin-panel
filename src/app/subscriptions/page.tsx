"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, RefreshCw, PlayCircle, BarChart3, ListChecks } from "lucide-react";
import { useSubscriptionsStore, useSubscriptionsQuery } from "@/features/subscriptions/hooks/useSubscriptions";
import { SubscriptionsTable } from "@/features/subscriptions/components/SubscriptionsTable";
import { SubscriptionDrawer } from "@/features/subscriptions/components/SubscriptionDrawer";
import { ForecastPanel } from "@/features/subscriptions/components/ForecastPanel";
import { SubscriptionAnalytics } from "@/features/subscriptions/components/SubscriptionAnalytics";
import { FulfillmentRunner } from "@/features/subscriptions/components/FulfillmentRunner";
import { SubscriptionAnalyticsCards } from "@/features/subscriptions/components/SubscriptionAnalyticsCards";
import { useSubscriptionDashboard } from "@/features/subscriptions/hooks/useSubscriptions";
import {
  FREQUENCY_LABELS,
  type SubscriptionStatus,
  type SubscriptionFrequency,
  type SubscriptionEntity,
} from "@/features/subscriptions/types/subscription";

type Tab = "operations" | "forecast" | "analytics";

const STATUS_TABS: { key: SubscriptionStatus; label: string }[] = [
  { key: "ACTIVE", label: "Active" },
  { key: "PAUSED", label: "Paused" },
  { key: "ON_VACATION", label: "Vacation" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "FAILED", label: "Failed" },
];

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<Tab>("operations");
  const [statusTab, setStatusTab] = useState<SubscriptionStatus>("ACTIVE");
  const filters = useSubscriptionsStore((s) => s.filters);
  const setFilters = useSubscriptionsStore((s) => s.setFilters);
  const setSelected = useSubscriptionsStore((s) => s.setSelectedSubscription);
  const setDrawerOpen = useSubscriptionsStore((s) => s.setDrawerOpen);

  const { data, isLoading, refetch, isFetching } = useSubscriptionsQuery();
  const dashboard = useSubscriptionDashboard();

  useEffect(() => {
    setFilters({ status: statusTab });
  }, [statusTab, setFilters]);

  const handleSelect = (sub: SubscriptionEntity) => {
    setSelected(sub);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor recurring meal subscriptions, run fulfillment, and forecast demand.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* Top-level tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(
            [
              { key: "operations", label: "Operations", icon: ListChecks },
              { key: "forecast", label: "Forecast", icon: PlayCircle },
              { key: "analytics", label: "Analytics", icon: BarChart3 },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "operations" && (
          <OperationsTab
            statusTab={statusTab}
            setStatusTab={setStatusTab}
            filters={filters}
            setFilters={setFilters}
            subscriptions={data?.data ?? []}
            loading={isLoading}
            onSelect={handleSelect}
            overview={dashboard.data?.overview}
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            total={data?.total ?? 0}
          />
        )}

        {tab === "forecast" && (
          <div className="space-y-4">
            <FulfillmentRunner />
            <ForecastPanel />
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-4">
            {dashboard.data?.overview && <SubscriptionAnalyticsCards overview={dashboard.data.overview} />}
            <SubscriptionAnalytics />
          </div>
        )}
      </div>

      <SubscriptionDrawer />
    </div>
  );
}

function OperationsTab({
  statusTab,
  setStatusTab,
  filters,
  setFilters,
  subscriptions,
  loading,
  onSelect,
  overview,
  page,
  totalPages,
  total,
}: {
  statusTab: SubscriptionStatus;
  setStatusTab: (s: SubscriptionStatus) => void;
  filters: any;
  setFilters: (f: Partial<any>) => void;
  subscriptions: SubscriptionEntity[];
  loading: boolean;
  onSelect: (s: SubscriptionEntity) => void;
  overview?: any;
  page: number;
  totalPages: number;
  total: number;
}) {
  return (
    <div className="space-y-4">
      {overview && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <QuickStat label="Active" value={overview.totalActive} color="text-emerald-600" />
          <QuickStat label="Paused" value={overview.totalPaused} color="text-amber-600" />
          <QuickStat label="Vacation" value={overview.totalOnVacation} color="text-sky-600" />
          <QuickStat label="MRR" value={`₹${Math.round(overview.mrr).toLocaleString("en-IN")}`} color="text-violet-600" />
        </div>
      )}

      {/* Status sub-tabs */}
      <div className="flex flex-wrap gap-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusTab(s.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusTab === s.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search customer, plan…"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <select
          value={filters.frequency}
          onChange={(e) => setFilters({ frequency: e.target.value as SubscriptionFrequency | "all" })}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-500"
        >
          <option value="all">All frequencies</option>
          {(Object.keys(FREQUENCY_LABELS) as SubscriptionFrequency[]).map((f) => (
            <option key={f} value={f}>
              {FREQUENCY_LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      <SubscriptionsTable subscriptions={subscriptions} loading={loading} onSelect={onSelect} />

      {(totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setFilters({ page: page - 1 })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setFilters({ page: page + 1 })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
