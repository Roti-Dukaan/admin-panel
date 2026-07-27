"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSubscriptionOrders,
  useSubscriptionSummary,
  useSubscriptionOrderDetail,
  useSubscriptionStageMutation,
  useSubscriptionRealtime,
  type SubscriptionFilterState,
} from "../hooks/useKitchenSubscriptions";
import { SubscriptionStats } from "./SubscriptionStats";
import { SubscriptionSummary } from "./SubscriptionSummary";
import { SubscriptionFilters } from "./SubscriptionFilters";
import { SubscriptionSearchBar } from "./SubscriptionSearchBar";
import { SubscriptionKanban } from "./SubscriptionKanban";
import { SubscriptionOrderDrawer } from "./SubscriptionOrderDrawer";
import type { SubscriptionOrderListItem, SubscriptionKitchenStage, MealSlot } from "../types/kitchen-subscriptions";

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">Something went wrong</p>
        <p className="text-sm text-gray-500">Could not load subscription orders.</p>
      </div>
      <Button type="button" onClick={onRetry} className="bg-orange-500 hover:bg-orange-600">
        Retry
      </Button>
    </div>
  );
}

export function SubscriptionsBoard() {
  const [search, setSearch] = useState("");
  const [mealSlot, setMealSlot] = useState<MealSlot>("all");
  const [status, setStatus] = useState<SubscriptionKitchenStage | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<SubscriptionOrderListItem | null>(null);

  const filters: SubscriptionFilterState = { search, mealSlot, status };
  const query = useSubscriptionOrders(filters);
  const summaryQuery = useSubscriptionSummary();
  const detailQuery = useSubscriptionOrderDetail(selectedOrder?.orderId ?? null);
  const mutation = useSubscriptionStageMutation();
  const realtime = useSubscriptionRealtime();

  const filtered = useMemo(() => query.data?.items ?? [], [query.data]);

  const byStage = useMemo(() => {
    const map: Record<SubscriptionKitchenStage, SubscriptionOrderListItem[]> = {
      PREPARING: [],
      READY: [],
      READY_FOR_DISPATCH: [],
    };
    for (const o of filtered) {
      if (map[o.stage]) map[o.stage].push(o);
    }
    return map;
  }, [filtered]);

  const stats = useMemo(
    () => ({
      preparing: byStage.PREPARING.length,
      ready: byStage.READY.length,
      readyForDispatch: byStage.READY_FOR_DISPATCH.length,
      total: filtered.length,
    }),
    [byStage, filtered]
  );

  const handleRefresh = () => query.refetch();

  const updatingId = mutation.isPending
    ? (mutation.variables as { id: string } | undefined)?.id ?? null
    : null;

  const handleAction = (orderId: string) => mutation.mutate({ id: orderId });

  if (query.isError && !query.data) {
    return <ErrorState onRetry={handleRefresh} />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50/50 p-6">
      <SubscriptionStats stats={stats} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SubscriptionSummary summary={summaryQuery.data} />
        <div className="flex flex-wrap items-center gap-3 lg:flex-1 lg:justify-end">
          <SubscriptionSearchBar value={search} onChange={setSearch} />
          <SubscriptionFilters
            mealSlot={mealSlot}
            onMealSlot={setMealSlot}
            status={status}
            onStatus={setStatus}
          />
        </div>
      </div>

      <SubscriptionKanban
        byStage={byStage}
        onOpen={setSelectedOrder}
        onAction={handleAction}
        updatingId={updatingId}
        isLoading={query.isLoading}
      />

      <SubscriptionOrderDrawer
        order={detailQuery.data ?? null}
        onClose={() => setSelectedOrder(null)}
        onMarkReady={handleAction}
        isUpdating={mutation.isPending}
      />
    </div>
  );
}
