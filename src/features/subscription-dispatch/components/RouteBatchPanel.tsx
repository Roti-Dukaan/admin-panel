"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Lock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubscriptionRouteBatch, SubscriptionRouteBatchStop } from "../services/subscription-dispatch.api";
import { useSubscriptionDispatchMutations } from "../hooks/useSubscriptionDispatch";

function SortableStopRow({
  stop,
  index,
  locked,
}: {
  stop: SubscriptionRouteBatchStop;
  index: number;
  locked: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
    disabled: locked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-white px-3 py-2 text-sm",
        isDragging && "opacity-80 shadow-md",
      )}
    >
      {!locked && (
        <button
          type="button"
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{stop.customerName}</p>
        <p className="truncate text-xs text-gray-500">{stop.address}</p>
        {stop.items.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {stop.items.map((item, index) => (
              <p key={`${stop.id}-item-${index}`} className="text-xs text-gray-600">
                {item.quantity}× {item.name}
              </p>
            ))}
          </div>
        )}
      </div>
      <span className="shrink-0 text-xs text-gray-500">
        {stop.totalQuantity > 0 ? `${stop.totalQuantity} items` : "—"}
      </span>
    </div>
  );
}

export function RouteBatchPanel({
  batch,
  onUpdated,
}: {
  batch: SubscriptionRouteBatch;
  onUpdated?: () => void;
}) {
  const { optimizeBatch, reorderBatch } = useSubscriptionDispatchMutations();
  const [stops, setStops] = React.useState(batch.stops);
  const [locked, setLocked] = React.useState(
    batch.optimizationStatus === "MANUAL_OVERRIDE",
  );
  const busy = optimizeBatch.isPending || reorderBatch.isPending;

  React.useEffect(() => {
    setStops(batch.stops);
    setLocked(batch.optimizationStatus === "MANUAL_OVERRIDE");
  }, [batch]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || locked) return;
    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    setStops(arrayMove(stops, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    try {
      await reorderBatch.mutateAsync({
        id: batch.id,
        stops: stops.map((stop, index) => ({ deliveryId: stop.id, sequence: index + 1 })),
        optimizationStatus: "MANUAL_OVERRIDE",
      });
      setLocked(true);
      toast.success("Route order saved");
      onUpdated?.();
    } catch {
      toast.error("Failed to save route order");
    }
  };

  const handleOptimize = async () => {
    try {
      await optimizeBatch.mutateAsync(batch.id);
      toast.success("Route optimized");
      onUpdated?.();
    } catch {
      toast.error("Optimization failed");
    }
  };

  const distanceKm =
    batch.estimatedDistance != null ? (batch.estimatedDistance / 1000).toFixed(1) : "—";
  const durationMin =
    batch.estimatedDuration != null ? Math.round(batch.estimatedDuration / 60) : "—";

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-indigo-900">Route batch</h4>
          <p className="text-xs text-indigo-800/80">
            Driver: {batch.driverName ?? "Unassigned"} · {batch.totalStops} stops · {batch.totalQty}{" "}
            rotis
          </p>
          <p className="text-xs text-indigo-700/70">
            {batch.optimizationStatus} via {batch.optimizationProvider} · ~{distanceKm} km · ~
            {durationMin} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={handleOptimize}>
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
            Re-optimize
          </Button>
          {!locked && (
            <Button type="button" size="sm" disabled={busy} onClick={saveOrder}>
              <Lock className="mr-1 h-4 w-4" />
              Lock order
            </Button>
          )}
          {batch.fullRouteUrl && (
            <a href={batch.fullRouteUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm" variant="outline">
                Full route
              </Button>
            </a>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stops.map((stop, index) => (
              <SortableStopRow key={stop.id} stop={stop} index={index} locked={locked} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
