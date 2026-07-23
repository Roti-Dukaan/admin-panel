"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Header } from "@/components/layout/header"
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter"
import { StatsCards } from "@/features/reports/components/StatsCards"
import { RevenueChart } from "@/features/reports/components/RevenueChart"
import { OrdersChart } from "@/features/reports/components/OrdersChart"
import { MenuPerformance } from "@/features/reports/components/MenuPerformance"
import { SubscriptionInsights } from "@/features/reports/components/SubscriptionInsights"
import { DeliveryAnalytics } from "@/features/reports/components/DeliveryAnalytics"
import { PaymentAnalytics } from "@/features/reports/components/PaymentAnalytics"
import { CustomerInsights } from "@/features/reports/components/CustomerInsights"
import { BestSellingItems } from "@/features/reports/components/BestSellingItems"
import { RecentActivity } from "@/features/reports/components/RecentActivity"
import { RefreshCw } from "lucide-react"
import { useReportsStore } from "@/features/reports/hooks/useReports"
import type { DateRange } from "@/features/reports/types/report"

export default function BranchReportsPage() {
  const { dateRange, setDateRange, setCustomStartDate, setCustomEndDate, loading, refreshData, granularity, setGranularity } = useReportsStore()

  const dateRangeValue: DateRangeValue = {
    preset: dateRange === "all" ? "today" : dateRange as DateRangeValue["preset"],
    startDate: "",
    endDate: "",
  }

  const handleDateRangeChange = (value: DateRangeValue) => {
    setDateRange(value.preset as DateRange)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Branch Reports"
        subtitle="Track your branch performance with real-time insights."
        showSearch={false}
        dateFilter={<DateRangeFilter value={dateRangeValue} onChange={handleDateRangeChange} />}
        actions={
          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="p-6 space-y-6">
        <StatsCards />

        {/* Revenue + Orders Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <OrdersChart />
          </div>
        </div>

        {/* Menu + Subscription Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MenuPerformance />
          <SubscriptionInsights />
        </div>

        {/* Delivery + Payment Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DeliveryAnalytics />
          <PaymentAnalytics />
        </div>

        {/* Customer + Best Selling + Activity Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CustomerInsights />
          <BestSellingItems />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}