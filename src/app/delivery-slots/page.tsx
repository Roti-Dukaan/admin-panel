"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  CalendarDays,
  BarChart3,
  XCircle,
  Search,
} from "lucide-react";
import { useDeliverySlotStore } from "@/features/delivery-slots/hooks/useDeliverySlots";
import { SlotsTable } from "@/features/delivery-slots/components/SlotsTable";
import { SlotDrawer } from "@/features/delivery-slots/components/SlotDrawer";
import { DeleteConfirmation } from "@/features/delivery-slots/components/DeleteConfirmation";

const statCards = [
  { key: "total", label: "Total Slots", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "active", label: "Active Slots", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "todayBookings", label: "Today's Bookings", icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "avgCapacity", label: "Avg Capacity", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50", suffix: "%" },
  { key: "disabled", label: "Disabled Slots", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
];

export default function DeliverySlotsPage() {
  const plans = useDeliverySlotStore((s) => s.slots);
  const stats = useMemo(() => {
    const activeSlots = plans.filter((s) => s.status === "active");
    const totalCapacity = activeSlots.reduce((sum, s) => sum + s.maxOrders, 0);
    const totalBooked = activeSlots.reduce((sum, s) => sum + s.currentBookings, 0);
    return {
      total: plans.length,
      active: activeSlots.length,
      todayBookings: plans.reduce((sum, s) => sum + s.todayBookings, 0),
      avgCapacity: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
      disabled: plans.filter((s) => s.status === "disabled").length,
    };
  }, [plans]);
  const searchQuery = useDeliverySlotStore((s) => s.searchQuery);
  const setSearchQuery = useDeliverySlotStore((s) => s.setSearchQuery);
  const statusFilter = useDeliverySlotStore((s) => s.statusFilter);
  const setStatusFilter = useDeliverySlotStore((s) => s.setStatusFilter);
  const mealFilter = useDeliverySlotStore((s) => s.mealFilter);
  const setMealFilter = useDeliverySlotStore((s) => s.setMealFilter);
  const openCreateDrawer = useDeliverySlotStore((s) => s.openCreateDrawer);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Delivery Slot Management</h1>
            <p className="mt-1 text-sm text-gray-500">Configure delivery schedules, capacities and booking availability.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"><RefreshCw className="h-4 w-4" /> Refresh</button>
            <button onClick={openCreateDrawer} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"><Plus className="h-4 w-4" /> Create Delivery Slot</button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const value = stats[card.key as keyof typeof stats];
            return (
              <motion.div key={card.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}><Icon className={`h-5 w-5 ${card.color}`} /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}{(card as { suffix?: string }).suffix || ""}</p>
                    <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search slots..." className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
            <div className="flex gap-1.5">
              {(["all", "active", "draft", "disabled"] as const).map((s) => {
                const labels = { all: "All", active: "Active", draft: "Draft", disabled: "Disabled" };
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${statusFilter === s ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                    {labels[s]}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5">
              {(["all", "breakfast", "lunch", "evening", "dinner"] as const).map((m) => {
                const labels = { all: "All Meals", breakfast: "🌅 Breakfast", lunch: "☀️ Lunch", evening: "🌆 Evening", dinner: "🌙 Dinner" };
                return (
                  <button key={m} onClick={() => setMealFilter(m)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${mealFilter === m ? "bg-orange-500 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                    {labels[m]}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <SlotsTable />
        </motion.div>
      </div>

      <SlotDrawer />
      <DeleteConfirmation />
    </div>
  );
}
