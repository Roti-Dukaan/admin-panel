"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Phone, MapPin, CreditCard, Clock, ChefHat, FileText, Package } from "lucide-react";
import { useKitchenStore } from "../hooks/useKitchen";
import { STATUS_CONFIG, PRIORITY_CONFIG, SLOT_CONFIG } from "../types/kitchen";

export function KitchenDrawer() {
  const selectedOrder = useKitchenStore((s) => s.selectedOrder);
  const drawerOpen = useKitchenStore((s) => s.drawerOpen);
  const setDrawerOpen = useKitchenStore((s) => s.setDrawerOpen);
  const moveOrder = useKitchenStore((s) => s.moveOrder);

  if (!selectedOrder) return null;

  const statusConf = STATUS_CONFIG[selectedOrder.status];
  const priorityConf = PRIORITY_CONFIG[selectedOrder.priority];
  const slotConf = SLOT_CONFIG[selectedOrder.deliverySlot];

  const timeline = [
    { label: "Order Placed", time: new Date(selectedOrder.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), done: true },
    { label: "Preparing", time: selectedOrder.preparationStartedAt ? new Date(selectedOrder.preparationStartedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—", done: ["preparing", "ready", "packed", "dispatched"].includes(selectedOrder.status) },
    { label: "Ready", time: "—", done: ["ready", "packed", "dispatched"].includes(selectedOrder.status) },
    { label: "Packed", time: "—", done: ["packed", "dispatched"].includes(selectedOrder.status) },
    { label: "Dispatched", time: "—", done: selectedOrder.status === "dispatched" },
  ];

  const nextStatusMap: Record<string, string> = {
    new: "preparing",
    preparing: "ready",
    ready: "packed",
    packed: "dispatched",
  };

  const nextStatus = nextStatusMap[selectedOrder.status];

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold text-white ${priorityConf.color}`}>
                      {priorityConf.label}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${statusConf.bgColor} ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Customer */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Customer</h3>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{selectedOrder.customerName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5" />
                    {selectedOrder.customerPhone}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {selectedOrder.customerAddress}
                  </div>
                </div>
              </section>

              {/* Items */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>{item.emoji}</span>
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Timeline */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Timeline</h3>
                <div className="space-y-0">
                  {timeline.map((step, i) => (
                    <div key={step.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${step.done ? "bg-emerald-500" : "bg-gray-200"}`} />
                        {i < timeline.length - 1 && (
                          <div className={`w-0.5 flex-1 ${step.done ? "bg-emerald-200" : "bg-gray-200"}`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                        <p className="text-xs text-gray-400">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Delivery */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Delivery</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Slot</p>
                    <p className="text-sm font-semibold text-gray-900">{slotConf.emoji} {slotConf.label}</p>
                    <p className="text-xs text-gray-400">{slotConf.time}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <CreditCard className="h-3.5 w-3.5" />
                      {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Notes */}
              {selectedOrder.preparationNotes && (
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Preparation Notes</h3>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <div className="flex items-start gap-2">
                      <ChefHat className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800">{selectedOrder.preparationNotes}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Special Instructions */}
              {selectedOrder.specialInstructions.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Special Instructions</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOrder.specialInstructions.map((instr) => (
                      <span key={instr} className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
                        <FileText className="h-3 w-3" />
                        {instr}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Cooking Preference */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Cooking Preference</h3>
                <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700">
                  <Package className="mr-1 h-3 w-3" />
                  {selectedOrder.cookingPreference}
                </span>
              </section>
            </div>

            {/* Footer Action */}
            {nextStatus && (
              <div className="sticky bottom-0 border-t bg-white px-6 py-4">
                <button
                  onClick={() => {
                    moveOrder(selectedOrder.id, nextStatus as import("../types/kitchen").OrderStatus);
                    setDrawerOpen(false);
                  }}
                  className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
                >
                  Move to {STATUS_CONFIG[nextStatus as import("../types/kitchen").OrderStatus]?.label}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
