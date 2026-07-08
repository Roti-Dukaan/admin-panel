"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "motion/react";
import { OrderStatus, STATUS_CONFIG } from "../types/kitchen";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { KitchenOrder } from "../types/kitchen";

interface KitchenColumnProps {
  status: OrderStatus;
  orders: KitchenOrder[];
}

export function KitchenColumn({ status, orders }: KitchenColumnProps) {
  const config = STATUS_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgWait = orders.length > 0
    ? Math.round(orders.reduce((sum, o) => {
        if (!o.preparationStartedAt) return sum;
        return sum + (Date.now() - o.preparationStartedAt) / 60000;
      }, 0) / orders.length)
    : 0;

  return (
    <div className="flex min-w-[280px] flex-col">
      {/* Column Header */}
      <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2.5 ${config.bgColor} ${config.borderColor} border`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{config.emoji}</span>
          <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center rounded-full ${config.bgColor} px-2 py-0.5 text-xs font-bold ${config.color}`}>
            {orders.length}
          </span>
          <span className="text-[11px] text-gray-400">{totalItems} items</span>
          {avgWait > 0 && status === "preparing" && (
            <span className="text-[11px] text-amber-500 font-medium">~{avgWait}m avg</span>
          )}
        </div>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2.5 rounded-xl p-2 transition-colors min-h-[200px] ${
          isOver ? "bg-blue-50/80 ring-2 ring-blue-200 ring-inset" : "bg-gray-50/50"
        }`}
      >
        <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {orders.map((order) => (
            <KitchenOrderCard key={order.id} order={order} />
          ))}
        </SortableContext>

        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400"
          >
            Drop orders here
          </motion.div>
        )}
      </div>
    </div>
  );
}
