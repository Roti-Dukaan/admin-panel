"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { KitchenCard } from "./KitchenCard";
import { STAGE_META } from "../types/kitchen";
import type { KitchenOrderView, KitchenStage } from "../types/kitchen";
import type { KitchenOrderDetail } from "@/lib/api/kitchen.api";

function KitchenCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="mt-3 h-4 w-28" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-3 h-9 w-full rounded-lg" />
    </div>
  );
}

/**
 * Tracks orders that just left the column so we can animate them out (fade +
 * slide-down) instead of removing them instantly. Keeps the card mounted for
 * EXIT_MS, then drops it. Used when an order is delivered and removed from the
 * live Kitchen Queue in real time.
 */
const EXIT_MS = 400;

function useExitingOrders(orders: KitchenOrderView[]) {
  const prev = useRef<KitchenOrderView[]>(orders);
  const [exiting, setExiting] = useState<KitchenOrderView[]>([]);

  useEffect(() => {
    const prevIds = new Set(prev.current.map((o) => o.orderId));
    const currentIds = new Set(orders.map((o) => o.orderId));
    const removed = prev.current.filter((o) => !currentIds.has(o.orderId) && prevIds.has(o.orderId));

    if (removed.length > 0) {
      setExiting((list) => [...list, ...removed]);
      const timer = setTimeout(() => {
        setExiting((list) =>
          list.filter((o) => !removed.some((r) => r.orderId === o.orderId)),
        );
      }, EXIT_MS);
      return () => clearTimeout(timer);
    }
    prev.current = orders;
  }, [orders]);

  // Keep prev in sync when nothing exited (runs every render where removed was empty)
  if (exiting.length === 0 && prev.current !== orders) prev.current = orders;

  return exiting;
}

export function KitchenColumn({
  stage,
  orders,
  now,
  detailMap,
  customerOrderCounts,
  onOpen,
  onAction,
  onCancel,
  updatingId,
  cancellingId,
  isLoading,
}: {
  stage: KitchenStage;
  orders: KitchenOrderView[];
  now: number;
  detailMap: Record<string, KitchenOrderDetail | undefined>;
  customerOrderCounts: Map<string, { count: number; name: string }>;
  onOpen: (order: KitchenOrderView) => void;
  onAction: (orderId: string, action: "preparing" | "ready") => void;
  onCancel: (order: KitchenOrderView) => void;
  updatingId: string | null;
  cancellingId: string | null;
  isLoading: boolean;
}) {
  const meta = STAGE_META[stage];
  const exiting = useExitingOrders(orders);

  // Orders currently shown + ones mid-exit animation (so they stay mounted).
  const exitingSet = new Set(exiting.map((o) => o.orderId));
  const visibleOrders = orders.filter((o) => !exitingSet.has(o.orderId));
  const allToRender = [...visibleOrders, ...exiting];

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl bg-white/60 ring-1 ring-black/5">
      <header className={cn("flex items-center justify-between gap-2 px-4 py-3", meta.columnClass)}>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{meta.emoji}</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">{meta.label}</h2>
        </div>
        <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-black/5">
          {isLoading ? "–" : orders.length}
        </span>
      </header>

      <div className="space-y-3 p-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <KitchenCardSkeleton key={i} />)
        ) : allToRender.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-300 ring-1 ring-black/5">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-gray-400">No {meta.label.toLowerCase()} kitchen orders</p>
          </div>
        ) : (
          allToRender.map((order) => (
            <KitchenCard
              key={order.ticketId}
              order={order}
              detail={detailMap[order.orderId]}
              now={now}
              customerOrderCount={
                order.customer?.id ? customerOrderCounts.get(order.customer.id)?.count : undefined
              }
              onOpen={() => onOpen(order)}
              onAction={(action) => onAction(order.orderId, action)}
              onCancel={() => onCancel(order)}
              isUpdating={updatingId === order.orderId}
              isCancelling={cancellingId === order.orderId}
              isExiting={exitingSet.has(order.orderId)}
            />
          ))
        )}
      </div>
    </section>
  );
}
