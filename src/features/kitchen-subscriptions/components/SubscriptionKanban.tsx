"use client";

import { SubscriptionColumn } from "./SubscriptionColumn";
import { SUBSCRIPTION_STAGES } from "../types/kitchen-subscriptions";
import type { SubscriptionOrderListItem, SubscriptionKitchenStage } from "../types/kitchen-subscriptions";

export function SubscriptionKanban({
  byStage,
  onOpen,
  onAction,
  updatingId,
  isLoading,
}: {
  byStage: Record<SubscriptionKitchenStage, SubscriptionOrderListItem[]>;
  onOpen: (order: SubscriptionOrderListItem) => void;
  onAction: (orderId: string) => void;
  updatingId: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {SUBSCRIPTION_STAGES.map((stage) => (
        <SubscriptionColumn
          key={stage}
          stage={stage}
          orders={byStage[stage]}
          onOpen={onOpen}
          onAction={onAction}
          updatingId={updatingId}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
