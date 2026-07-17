"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter"
import { OrderStatistics } from "@/features/orders/components/OrderStatistics"
import { OrderFilters } from "@/features/orders/components/OrderFilters"
import { OrdersTable } from "@/features/orders/components/OrdersTable"
import { OrderDrawer } from "@/features/orders/components/OrderDrawer"
import { useOrdersStore } from "@/features/orders/hooks/useOrders"
import { useAdminOrdersRealtime } from "@/features/orders/hooks/useOrdersRealtime"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/features/orders/types/order"
import type { OrderDatePreset } from "@/features/orders/types/order"
import { motion } from "motion/react"

export default function OrdersPage() {
  const { fetchOrders, fetchStatistics, setDrawerOpen, setSelectedOrder, refreshAll, loading, filters, setDateRange } = useOrdersStore()
  useAdminOrdersRealtime()

  const dateRangeValue: DateRangeValue = {
    preset: filters.dateFilter === "all" ? "today" : filters.dateFilter as DateRangeValue["preset"],
    startDate: filters.customStartDate,
    endDate: filters.customEndDate,
  }

  const handleDateRangeChange = (value: DateRangeValue) => {
    setDateRange(
      value.preset as OrderDatePreset,
      value.startDate || "",
      value.endDate || ""
    )
  }

  React.useEffect(() => {
    fetchOrders()
    fetchStatistics()
  }, [])

  const handleRefresh = async () => {
    await refreshAll()
    toast.success("Orders refreshed")
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Orders"
        subtitle="Manage and monitor all customer orders."
        showSearch={false}
        dateFilter={<DateRangeFilter value={dateRangeValue} onChange={handleDateRangeChange} />}
        actions={
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
      </div>

      <OrderDrawer />
    </div>
  )
}
