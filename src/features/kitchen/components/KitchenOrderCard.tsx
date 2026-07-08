"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { GripVertical, AlertCircle } from "lucide-react";
import { KitchenOrder, PRIORITY_CONFIG } from "../types/kitchen";
import { PreparationTimer } from "./PreparationTimer";
import { useKitchenStore } from "../hooks/useKitchen";

interface KitchenOrderCardProps {
  order: KitchenOrder;
  overlay?: boolean;
}

export function KitchenOrderCard({ order, overlay }: KitchenOrderCardProps) {
  const setSelectedOrder = useKitchenStore((s) => s.setSelectedOrder);
  const priority = PRIORITY_CONFIG[order.priority];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
    data: { order, status: order.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: isDragging ? 1.03 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`group relative rounded-xl border bg-white p-3.5 cursor-grab active:cursor-grabbing select-none ${
        overlay
          ? "shadow-2xl ring-2 ring-blue-400 rotate-[2deg] border-blue-300"
          : isDragging
          ? "shadow-xl border-blue-300 ring-1 ring-blue-100"
          : "shadow-sm border-gray-200/80 hover:shadow-md hover:border-gray-300"
      }`}
      onClick={() => !isDragging && setSelectedOrder(order)}
      {...listeners}
      {...attributes}
    >
      {/* Drag Handle Indicator */}
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
      </div>

      {/* Header: Order Number + Priority */}
      <div className="mb-2 flex items-center justify-between pl-4">
        <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${priority.color}`}>
          {priority.label}
        </span>
      </div>

      {/* Customer + Subscription */}
      <div className="mb-2 flex items-center justify-between pl-4">
        <span className="text-xs font-medium text-gray-600 truncate max-w-[140px]">{order.customerName}</span>
        {order.isSubscription && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            SUB
          </span>
        )}
      </div>

      {/* Items */}
      <div className="mb-2 flex flex-wrap gap-1 pl-4">
        {order.items.map((item) => (
          <span
            key={item.name}
            className="inline-flex items-center gap-0.5 rounded-md bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-100"
          >
            {item.emoji} {item.quantity} {item.name}
          </span>
        ))}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1 pl-4">
          {order.specialInstructions.map((instr) => (
            <span
              key={instr}
              className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200"
            >
              <AlertCircle className="h-2.5 w-2.5" />
              {instr}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Timer + Payment */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2 pl-4">
        <PreparationTimer
          startedAt={order.preparationStartedAt}
          estimatedMinutes={order.estimatedCompletionMinutes}
          status={order.status}
        />
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
            order.paymentMethod === "cod" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"
          }`}>
            {order.paymentMethod === "cod" ? "COD" : "Online"}
          </span>
          {order.cookingPreference !== "regular" && (
            <span className="inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
              {order.cookingPreference}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
