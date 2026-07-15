"use client";

import { KitchenColumn } from "./KitchenColumn";
import { STAGES } from "../types/kitchen";
import type { KitchenOrderView, KitchenStage } from "../types/kitchen";
import type { KitchenOrderDetail } from "@/lib/api/kitchen.api";

export function KitchenKanban({
  byStage,
  now,
  detailMap,
  onOpen,
  onAction,
  updatingId,
  isLoading,
}: {
  byStage: Record<KitchenStage, KitchenOrderView[]>;
  now: number;
  detailMap: Record<string, KitchenOrderDetail | undefined>;
  onOpen: (order: KitchenOrderView) => void;
  onAction: (orderId: string, action: "preparing" | "ready") => void;
  updatingId: string | null;
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
          onOpen={onOpen}
          onAction={onAction}
          updatingId={updatingId}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
