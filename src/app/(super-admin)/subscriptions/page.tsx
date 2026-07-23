"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Search, RefreshCw, CreditCard } from "lucide-react";
import { Header } from "@/components/layout/header";
import { SubscriptionsTable } from "@/features/subscriptions/components/SubscriptionsTable";
import { SubscriptionDrawer } from "@/features/subscriptions/components/SubscriptionDrawer";
import { FulfillmentRunner } from "@/features/subscriptions/components/FulfillmentRunner";
import { FulfillmentHistory } from "@/features/subscriptions/components/FulfillmentHistory";
import {
  useSubscriptionsStore,
  useSubscriptionsQuery,
} from "@/features/subscriptions/hooks/useSubscriptions";
import type { SubscriptionStatus } from "@/features/subscriptions/types/subscription";

const STATUS_FILTERS: { key: SubscriptionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "PAUSED", label: "Paused" },
  { key: "ON_VACATION", label: "Vacation" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "EXPIRED", label: "Expired" },
  { key: "FAILED", label: "Failed" },
];

export default function SubscriptionsPage() {
  const filters = useSubscriptionsStore((s) => s.filters);
  const setFilters = useSubscriptionsStore((s) => s.setFilters);
  const setSelected = useSubscriptionsStore((s) => s.setSelectedSubscription);
  const setDrawerOpen = useSubscriptionsStore((s) => s.setDrawerOpen);

  const { data, isLoading, isFetching, refetch } = useSubscriptionsQuery();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const subscriptions = data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscriptions"
        subtitle="Manage customer subscriptions, deliveries and lifecycle."
        actions={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Search by customer or plan..."
                className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setFilters({ status: status.key })}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    filters.status === status.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-white text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <SubscriptionsTable
          subscriptions={subscriptions}
          loading={isLoading}
          onSelect={(sub) => {
            setSelected(sub);
            setDrawerOpen(true);
          }}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FulfillmentRunner />
          <FulfillmentHistory />
        </div>

        {data && data.total > data.limit && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters({ page: filters.page - 1 })}
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              disabled={filters.page >= data.totalPages}
              onClick={() => setFilters({ page: filters.page + 1 })}
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <SubscriptionDrawer />
    </div>
  );
}
