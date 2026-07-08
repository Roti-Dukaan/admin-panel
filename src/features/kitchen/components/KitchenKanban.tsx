"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion } from "motion/react";
import { useKitchenStore } from "../hooks/useKitchen";
import { KitchenColumn } from "./KitchenColumn";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { COLUMN_ORDER, OrderStatus, KitchenOrder } from "../types/kitchen";

export function KitchenKanban() {
  const orders = useKitchenStore((s) => s.orders);
  const currentSlot = useKitchenStore((s) => s.currentSlot);
  const filters = useKitchenStore((s) => s.filters);
  const moveOrder = useKitchenStore((s) => s.moveOrder);
  const [activeOrder, setActiveOrder] = useState<KitchenOrder | null>(null);

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((o) => o.deliverySlot === currentSlot);
    if (filters.priority.length > 0) {
      filtered = filtered.filter((o) => filters.priority.includes(o.priority));
    }
    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter((o) => filters.paymentMethod.includes(o.paymentMethod));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [orders, currentSlot, filters]);

  const ordersByStatus = useMemo(() => {
    const map: Record<OrderStatus, KitchenOrder[]> = {
      new: [], preparing: [], ready: [], packed: [], dispatched: [],
    };
    for (const order of filteredOrders) {
      map[order.status].push(order);
    }
    return map;
  }, [filteredOrders]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const order = active.data.current?.order as KitchenOrder | undefined;
    if (order) setActiveOrder(order);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;

    const activeOrder = active.data.current?.order as KitchenOrder | undefined;
    if (!activeOrder) return;

    const overId = over.id as string;
    const newStatus = COLUMN_ORDER.includes(overId as OrderStatus)
      ? (overId as OrderStatus)
      : (over.data.current?.status as OrderStatus | undefined);

    if (newStatus && newStatus !== activeOrder.status) {
      moveOrder(activeOrder.id, newStatus);
    }
  }, [moveOrder]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMN_ORDER.map((status) => (
            <div key={status} className="min-w-[280px] flex-1">
              <KitchenColumn status={status} orders={ordersByStatus[status]} />
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeOrder ? <KitchenOrderCard order={activeOrder} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
