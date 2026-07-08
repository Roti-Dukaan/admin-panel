"use client";

import { motion } from "motion/react";
import { KitchenHeader } from "@/features/kitchen/components/KitchenHeader";
import { KitchenStats } from "@/features/kitchen/components/KitchenStats";
import { ProductionSummary } from "@/features/kitchen/components/ProductionSummary";
import { SlotSelector } from "@/features/kitchen/components/SlotSelector";
import { KitchenKanban } from "@/features/kitchen/components/KitchenKanban";
import { KitchenDrawer } from "@/features/kitchen/components/KitchenDrawer";
import { KitchenAlerts } from "@/features/kitchen/components/KitchenAlerts";
import { QuickFilters } from "@/features/kitchen/components/QuickFilters";
import { SearchBar } from "@/features/kitchen/components/SearchBar";

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-5">
        {/* Header */}
        <KitchenHeader />

        {/* KPI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <KitchenStats />
        </motion.div>

        {/* Slot Selector + Filters + Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <SlotSelector />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar />
            <QuickFilters />
          </div>
        </motion.div>

        {/* Production Summary + Kanban */}
        <div className="flex gap-5">
          {/* Sticky Production Summary */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="hidden w-[280px] shrink-0 lg:block"
          >
            <div className="sticky top-6">
              <ProductionSummary />
            </div>
          </motion.div>

          {/* Kanban Board */}
          <div className="min-w-0 flex-1">
            <KitchenKanban />
          </div>
        </div>

        {/* Kitchen Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Kitchen Alerts</h2>
          <KitchenAlerts />
        </motion.div>
      </div>

      {/* Order Details Drawer */}
      <KitchenDrawer />
    </div>
  );
}
