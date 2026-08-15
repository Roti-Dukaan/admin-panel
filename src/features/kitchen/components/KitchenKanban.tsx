"use client";

import { KitchenColumn } from "./KitchenColumn";
import { STAGES } from "../types/kitchen";
import type { KitchenOrderView, KitchenStage } from "../types/kitchen";
import type { KitchenOrderDetail } from "@/lib/api/kitchen.api";

export function KitchenKanban({
  byStage,
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
  byStage: Record<KitchenStage, KitchenOrderView[]>;
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
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {STAGES.map((stage) => (
        <KitchenColumn
          key={stage}
          stage={stage}
          orders={byStage[stage]}
          now={now}
          detailMap={detailMap}
          customerOrderCounts={customerOrderCounts}
          onOpen={onOpen}
          onAction={onAction}
          onCancel={onCancel}
          updatingId={updatingId}
          cancellingId={cancellingId}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
