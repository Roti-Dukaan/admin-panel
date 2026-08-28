"use client";

import { formatIstTime } from "@/lib/date";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DISPATCH_STATUS_META, type DispatchBatchListItem } from "../types/dispatch";

interface Props {
  batch: DispatchBatchListItem;
  onOpen: (batch: DispatchBatchListItem) => void;
}

export function DispatchBatchCard({ batch, onOpen }: Props) {
  const meta = DISPATCH_STATUS_META[batch.status];

  return (
    <button
      type="button"
      onClick={() => onOpen(batch)}
      className="w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition-all hover:ring-orange-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">#{batch.batchNumber}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {batch.totalOrders} order{batch.totalOrders !== 1 ? "s" : ""}
            {batch.deliveryZone ? ` • ${batch.deliveryZone}` : ""}
          </p>
        </div>
        <Badge className={`${meta.bg} ${meta.color} border-0 text-xs`}>{meta.label}</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-3">
          {batch.driverCount > 0 && (
            <span>{batch.driverCount} rider{batch.driverCount !== 1 ? "s" : ""}</span>
          )}
          {batch.provider && <span className="capitalize">{batch.provider}</span>}
        </div>
        <span>{formatIstTime(batch.createdAt)}</span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-orange-600">
        View details <ChevronRight className="h-3 w-3" />
      </div>
    </button>
  );
}
