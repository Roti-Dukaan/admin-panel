"use client";

import { Inbox } from "lucide-react";
import { SubscriptionCard } from "./SubscriptionCard";
import { SUBSCRIPTION_STAGE_META } from "../types/kitchen-subscriptions";
import type { SubscriptionOrderListItem, SubscriptionKitchenStage } from "../types/kitchen-subscriptions";

export function SubscriptionColumn({
  stage,
  orders,
  onOpen,
  onAction,
  updatingId,
  isLoading,
}: {
  stage: SubscriptionKitchenStage;
  orders: SubscriptionOrderListItem[];
  onOpen: (order: SubscriptionOrderListItem) => void;
  onAction: (orderId: string) => void;
  updatingId: string | null;
  isLoading: boolean;
}) {
  const meta = SUBSCRIPTION_STAGE_META[stage];

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl bg-white/60 ring-1 ring-black/5">
      <header className={`flex items-center justify-between gap-2 px-4 py-3 ${meta.columnClass}`}>
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
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex animate-pulse items-center justify-between">
                <div className="h-5 w-24 rounded-full bg-gray-200" />
                <div className="h-4 w-14 rounded bg-gray-200" />
              </div>
              <div className="mt-3 h-4 w-28 rounded bg-gray-200" />
              <div className="mt-3 h-9 w-full rounded-lg bg-gray-200" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-300 ring-1 ring-black/5">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-gray-400">No {meta.label.toLowerCase()} orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <SubscriptionCard
              key={order.orderId}
              order={order}
              onOpen={() => onOpen(order)}
              onAction={() => onAction(order.orderId)}
              isUpdating={updatingId === order.orderId}
            />
          ))
        )}
      </div>
    </section>
  );
}
