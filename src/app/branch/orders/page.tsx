"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter"
import { OrderStatistics } from "@/features/orders/components/OrderStatistics"
import { OrderFilters } from "@/features/orders/components/OrderFilters"
import { OrdersTable } from "@/features/orders/components/OrdersTable"
import { OrderDrawer } from "@/features/orders/components/OrderDrawer"
import { useOrdersStore } from "@/features/orders/hooks/useOrders"
import { useBranchOrdersRealtime } from "@/features/orders/hooks/useBranchOrdersRealtime"
import { BranchSubscriptionDeliveriesTab } from "@/features/delivery/components/BranchSubscriptionDeliveriesTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/features/orders/types/order"
import type { OrderDatePreset } from "@/features/orders/types/order"
import { motion } from "motion/react"

type BranchOrderTab = "one-time" | "subscriptions"

export default function BranchOrdersPage() {
  const { branchId } = useWorkspace()
  const { fetchOrders, fetchStatistics, setDrawerOpen, setSelectedOrder, refreshAll, loading, filters, setDateRange } =
    useOrdersStore()
  useBranchOrdersRealtime()

  const [activeTab, setActiveTab] = React.useState<BranchOrderTab>("one-time")

  const dateRangeValue: DateRangeValue = {
    preset: filters.dateFilter === "all" ? "today" : (filters.dateFilter as DateRangeValue["preset"]),
    startDate: filters.customStartDate,
    endDate: filters.customEndDate,
  }

  const handleDateRangeChange = (value: DateRangeValue) => {
    setDateRange(value.preset as OrderDatePreset, value.startDate || "", value.endDate || "")
  }

  React.useEffect(() => {
    if (activeTab === "one-time" && branchId) {
      fetchOrders()
      fetchStatistics()
    }
  }, [activeTab, branchId])

  const handleRefresh = async () => {
    await refreshAll()
    toast.success("Orders refreshed")
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  if (!branchId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Branch context not loaded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Orders"
        subtitle="Manage one-time and subscription orders for your branch."
        showSearch={false}
        dateFilter={
          activeTab === "one-time" ? (
            <DateRangeFilter value={dateRangeValue} onChange={handleDateRangeChange} />
          ) : undefined
        }
        actions={
          activeTab === "one-time" ? (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Refresh orders"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          ) : undefined
        }
      />

      <div className="px-6 pt-4 pb-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as BranchOrderTab)}
        >
          <TabsList>
            <TabsTrigger value="one-time">One-time Orders</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="mt-4 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <OrderStatistics />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <OrderFilters />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <OrdersTable onViewDetails={handleViewDetails} />
            </motion.div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            <BranchSubscriptionDeliveriesTab branchId={branchId} />
          </TabsContent>
        </Tabs>
      </div>

      <OrderDrawer />
    </div>
  )
}
