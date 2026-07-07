"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { OrderStatistics } from "@/features/orders/components/OrderStatistics"
import { OrderFilters } from "@/features/orders/components/OrderFilters"
import { OrdersTable } from "@/features/orders/components/OrdersTable"
import { OrderDrawer } from "@/features/orders/components/OrderDrawer"
import { useOrdersStore } from "@/features/orders/hooks/useOrders"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/features/orders/types/order"
import { motion } from "motion/react"

export default function OrdersPage() {
  const { fetchOrders, fetchStatistics, setDrawerOpen, setSelectedOrder, refreshAll, loading } = useOrdersStore()

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
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-1" />
              Export (Soon)
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
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
