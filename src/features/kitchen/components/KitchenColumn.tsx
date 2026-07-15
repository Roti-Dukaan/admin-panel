"use client";

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

export function KitchenColumn({
  stage,
  orders,
  now,
  detailMap,
  onOpen,
  onAction,
  updatingId,
  isLoading,
}: {
  stage: KitchenStage;
  orders: KitchenOrderView[];
  now: number;
  detailMap: Record<string, KitchenOrderDetail | undefined>;
  onOpen: (order: KitchenOrderView) => void;
  onAction: (orderId: string, action: "preparing" | "ready") => void;
  updatingId: string | null;
  isLoading: boolean;
}) {
  const meta = STAGE_META[stage];

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
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-300 ring-1 ring-black/5">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-gray-400">No {meta.label.toLowerCase()} kitchen orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <KitchenCard
              key={order.ticketId}
              order={order}
              detail={detailMap[order.orderId]}
              now={now}
              onOpen={() => onOpen(order)}
              onAction={(action) => onAction(order.orderId, action)}
              isUpdating={updatingId === order.orderId}
            />
          ))
        )}
      </div>
    </section>
  );
}
