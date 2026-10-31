"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCancelDialog } from "@/features/orders/components/OrderCancelDialog";
import { useKitchenOrders, useKitchenDetailMap, useKitchenStageMutation, useKitchenCancelMutation, useKitchenRealtime, applyKitchenFilters } from "../hooks/useKitchen";
import { usePrepClock, elapsedSeconds } from "../hooks/usePrepClock";
import { KitchenStats, type KitchenStatsData } from "./KitchenStats";
import { ProductionSummary, type ProductionItem } from "./ProductionSummary";
import { SlotSelector } from "./SlotSelector";
import { SearchBar } from "./SearchBar";
import { QuickFilters } from "./QuickFilters";
import { KitchenStatusSelector } from "@/features/kitchen-operations/KitchenStatusSelector";
import { KitchenKanban } from "./KitchenKanban";
import { KitchenAlerts, type KitchenAlert } from "./KitchenAlerts";
import { KitchenOrderDrawer } from "./KitchenOrderDrawer";
import { SubscriptionLoadCard } from "./SubscriptionLoadCard";
import { STAGES } from "../types/kitchen";
import type { KitchenOrderView, KitchenStage, DeliveryKind, PaymentFilter, PrepTimeFilter } from "../types/kitchen";
import { buildCustomerActiveOrderCounts } from "../utils/customer-order-count";

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">Something went wrong</p>
        <p className="text-sm text-gray-500">We couldn’t load the kitchen board. Please try again.</p>
      </div>
      <Button type="button" onClick={onRetry} className="bg-orange-500 hover:bg-orange-600">
        Retry
      </Button>
    </div>
  );
}

export function KitchenBoard() {
  const now = usePrepClock(true);
  const [search, setSearch] = useState("");
  const [deliveryKind, setDeliveryKind] = useState<DeliveryKind | "all">("all");
  const [payment, setPayment] = useState<PaymentFilter>("all");
  const [prepTime, setPrepTime] = useState<PrepTimeFilter>("oldest");
  const [slot, setSlot] = useState<string>("all");
  const [selected, setSelected] = useState<KitchenOrderView | null>(null);
  const [cancelTarget, setCancelTarget] = useState<KitchenOrderView | null>(null);

  const filters = useMemo(
    () => ({ search, deliveryKind, payment, prepTime, slot }),
    [search, deliveryKind, payment, prepTime, slot],
  );
  const query = useKitchenOrders(filters);
  const orderIds = useMemo(() => (query.data?.items ?? []).map((i) => i.orderId), [query.data]);
  const detailMap = useKitchenDetailMap(orderIds);
  const mutation = useKitchenStageMutation();
  const cancelMutation = useKitchenCancelMutation();
  const realtime = useKitchenRealtime({
    onNewOrder: (payload) => {
      const minimal: KitchenOrderView = {
        ticketId: payload.ticketId,
        ticketNumber: payload.ticketNumber,
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        kitchenStatus: "PENDING",
        stageLabel: "New Orders",
        priority: "NORMAL",
        customer: null,
        itemsCount: 0,
        totalQuantity: 0,
        deliveryType: "DELIVERY",
        orderCreatedAt: new Date().toISOString(),
        timer: { elapsedMinutes: 0, preparingMinutes: null, readyDurationMinutes: null, isReady: false },
      };
      setSelected(minimal);
    },
  });

  const enriched = useMemo<KitchenOrderView[]>(
    () => (query.data?.items ?? []).map((i) => ({ ...i })),
    [query.data]
  );
  const filtered = useMemo(
    () => applyKitchenFilters(enriched, filters, detailMap),
    [enriched, filters, detailMap]
  );

  const byStage = useMemo(() => {
    const map: Record<KitchenStage, KitchenOrderView[]> = { PENDING: [], PREPARING: [], READY_FOR_PICKUP: [] };
    for (const o of filtered) map[o.kitchenStatus].push(o);
    return map;
  }, [filtered]);

  const customerOrderCounts = useMemo(
    () => buildCustomerActiveOrderCounts(filtered),
    [filtered],
  );

  const counts = useMemo(
    () => ({
      pending: byStage.PENDING.length,
      preparing: byStage.PREPARING.length,
      ready: byStage.READY_FOR_PICKUP.length,
    }),
    [byStage]
  );

  const stats = useMemo<KitchenStatsData>(() => {
    const elapsed = (o: KitchenOrderView) => elapsedSeconds(o.orderCreatedAt, now) / 60;
    const delayed = filtered.filter(
      (o) => (o.kitchenStatus === "PENDING" || o.kitchenStatus === "PREPARING") && elapsed(o) > 20
    ).length;
    const preparing = byStage.PREPARING;
    const avgPrep = preparing.length
      ? Math.round(
          preparing.reduce((s, o) => s + (o.timer.preparingMinutes ?? o.timer.elapsedMinutes), 0) / preparing.length
        )
      : 0;
    return {
      pending: counts.pending,
      preparing: counts.preparing,
      ready: counts.ready,
      total: counts.pending + counts.preparing + counts.ready,
      delayed,
      avgPrep,
    };
  }, [byStage, counts, filtered, now]);

  const slotOptions = useMemo(
    () => Array.from(new Set(enriched.map((o) => o.deliverySlot?.name).filter(Boolean))) as string[],
    [enriched]
  );

  const production = useMemo<ProductionItem[]>(() => {
    const statusById = new Map(enriched.map((o) => [o.orderId, o.kitchenStatus]));
    const map = new Map<string, ProductionItem>();
    for (const detail of Object.values(detailMap)) {
      if (!detail) continue;
      const status = statusById.get(detail.orderId);
      for (const item of detail.items) {
        const prev =
          map.get(item.foodNameSnapshot) ?? {
            name: item.foodNameSnapshot,
            emoji: "🍽️",
            required: 0,
            prepared: 0,
          };
        prev.required += item.quantity;
        if (status === "READY_FOR_PICKUP") prev.prepared += item.quantity;
        map.set(item.foodNameSnapshot, prev);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.required - a.required);
  }, [detailMap, enriched]);

  const alerts = useMemo<KitchenAlert[]>(() => {
    const list: KitchenAlert[] = [];
    for (const o of filtered) {
      const elapsedMin = elapsedSeconds(o.orderCreatedAt, now) / 60;
      if (o.kitchenStatus === "PENDING" && elapsedMin > 20) {
        list.push({ id: `${o.orderId}-p`, type: "danger", message: `${o.orderNumber} has been waiting ${Math.floor(elapsedMin)}m` });
      }
      if (o.kitchenStatus === "PREPARING" && o.timer.preparingMinutes != null && o.timer.preparingMinutes > 20) {
        list.push({ id: `${o.orderId}-pr`, type: "warning", message: `${o.orderNumber} is prepping for ${o.timer.preparingMinutes}m` });
      }
    }
    return list;
  }, [filtered, now]);

  const handleRefresh = () => query.refetch();

  const updatingId = mutation.isPending ? (mutation.variables as { id: string } | undefined)?.id ?? null : null;
  const cancellingId = cancelMutation.isPending
    ? (cancelMutation.variables as { orderId: string } | undefined)?.orderId ?? null
    : null;
  const handleAction = (orderId: string, action: "preparing" | "ready") => mutation.mutate({ id: orderId, action });
  const handleCancelRequest = (order: KitchenOrderView) => setCancelTarget(order);
  const handleCancelConfirm = (reason: string) => {
    if (!cancelTarget) return;
    cancelMutation.mutate(
      { orderId: cancelTarget.orderId, reason },
      {
        onSuccess: () => {
          setCancelTarget(null);
          if (selected?.orderId === cancelTarget.orderId) setSelected(null);
        },
      },
    );
  };

  if (query.isError && !query.data) {
    return <ErrorState onRetry={handleRefresh} />;
  }

const isLoading = query.isLoading;

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50/50 p-6">
      <KitchenStats stats={stats} />
      <SubscriptionLoadCard />

<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SlotSelector slots={slotOptions} value={slot} onChange={setSlot} />
        <div className="flex flex-wrap items-center gap-3 lg:flex-1 lg:justify-end">
          <KitchenStatusSelector />
          <SearchBar value={search} onChange={setSearch} />
          <QuickFilters
            deliveryKind={deliveryKind}
            onDeliveryKind={setDeliveryKind}
            payment={payment}
            onPayment={setPayment}
            prepTime={prepTime}
            onPrepTime={setPrepTime}
          />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-6">
            <ProductionSummary items={production} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <KitchenKanban
            byStage={byStage}
            now={now}
            detailMap={detailMap}
            customerOrderCounts={customerOrderCounts}
            onOpen={setSelected}
            onAction={handleAction}
            onCancel={handleCancelRequest}
            updatingId={updatingId}
            cancellingId={cancellingId}
            isLoading={isLoading}
          />
        </div>
      </div>

      <KitchenAlerts alerts={alerts} />

      <KitchenOrderDrawer
        order={selected}
        onClose={() => setSelected(null)}
        onCancel={() => selected && handleCancelRequest(selected)}
        isCancelling={!!selected && cancellingId === selected.orderId}
      />

      <OrderCancelDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        orderNumber={cancelTarget?.orderNumber}
        confirming={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
        idPrefix="kitchen-cancel"
      />
    </div>
  );
}
