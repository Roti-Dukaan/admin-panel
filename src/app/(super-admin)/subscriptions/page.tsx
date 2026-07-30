"use client";

import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FulfillmentRunner } from "@/features/subscriptions/components/FulfillmentRunner";
import { FulfillmentHistory } from "@/features/subscriptions/components/FulfillmentHistory";
import { CustomerSubscriptionsPanel } from "@/features/subscriptions/components/CustomerSubscriptionsPanel";
import { useSubscriptionsQuery } from "@/features/subscriptions/hooks/useSubscriptions";

export default function SubscriptionsPage() {
  const { isFetching, refetch } = useSubscriptionsQuery();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Fulfillment"
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
        <CustomerSubscriptionsPanel />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FulfillmentRunner />
          <FulfillmentHistory />
        </div>
      </div>
    </div>
  );
}
