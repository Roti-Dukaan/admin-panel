"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter"
import { motion } from "motion/react"
import { formatDistanceToNow } from "date-fns"
import {
  ShoppingBag,
  IndianRupee,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  Package,
  MoreHorizontal,
  UtensilsCrossed,
} from "lucide-react"
import Link from "next/link"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"
import { useBranchDashboard } from "@/features/branch-dashboard/hooks/useBranchDashboard"
import { useSuperAdminDashboard } from "@/features/super-admin-dashboard/hooks/useSuperAdminDashboard"
import {
  DashboardLocationFilters,
  type DashboardLocationFiltersValue,
} from "@/features/super-admin-dashboard/components/DashboardLocationFilters"
import { normalizeOrderStatus } from "@/features/orders/utils/status"
import type { SuperAdminDashboardFilters } from "@/features/super-admin-dashboard/types/dashboard"

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "pending-confirmation": { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  pending: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  preparing: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  packed: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "ready-for-pickup": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "out-for-delivery": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
}

const statusLabels: Record<string, string> = {
  "pending-confirmation": "Pending",
  confirmed: "Confirmed",
  pending: "Pending",
  preparing: "Preparing",
  packed: "Packed",
  "ready-for-pickup": "Packed",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
}

function formatChangePercent(value: number | null | undefined): string {
  if (value == null) return ""
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value}%`
}

function buildDashboardFilters(
  dateRange: DateRangeValue,
  location: DashboardLocationFiltersValue,
): SuperAdminDashboardFilters {
  return {
    datePreset: dateRange.preset,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    cityId: location.cityId,
    areaId: location.areaId,
    branchId: location.branchId,
  }
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({ preset: "today" })
  const [locationFilters, setLocationFilters] = React.useState<DashboardLocationFiltersValue>({})
  const user = useAdminAuthStore((s) => s.user)
  const userRoles = user?.roles ?? []
  const isBranchManager = userRoles.includes("BRANCH_MANAGER")
  const isSuperAdminView = !isBranchManager

  const dashboardFilters = React.useMemo(
    () => buildDashboardFilters(dateRange, locationFilters),
    [dateRange, locationFilters],
  )

  const { data: branchStats, isLoading: branchStatsLoading } = useBranchDashboard(isBranchManager)
  const {
    data: superAdminStats,
    isLoading: superAdminLoading,
    error: superAdminError,
    refetch: refetchSuperAdmin,
  } = useSuperAdminDashboard(dashboardFilters, isSuperAdminView)

  const liveStats = branchStats?.data
  const branchName = user?.branchId ? `Branch ${user.branchId.slice(0, 8)}` : ""
  const isToday = dateRange.preset === "today"

  const superAdminKpis = superAdminStats
    ? [
        {
          label: isToday ? "Today's Revenue" : "Revenue",
          value: `₹${superAdminStats.totalRevenue.toLocaleString("en-IN")}`,
          change: formatChangePercent(superAdminStats.revenueChangePercent),
          trend: (superAdminStats.revenueChangePercent ?? 0) >= 0 ? ("up" as const) : ("down" as const),
          icon: IndianRupee,
          color: "bg-emerald-500",
          lightColor: "bg-emerald-50",
        },
        {
          label: "Total Orders",
          value: String(superAdminStats.totalOrders),
          change: formatChangePercent(superAdminStats.ordersChangePercent),
          trend: (superAdminStats.ordersChangePercent ?? 0) >= 0 ? ("up" as const) : ("down" as const),
          icon: ShoppingBag,
          color: "bg-orange-500",
          lightColor: "bg-orange-50",
        },
        {
          label: "Active Customers",
          value: String(superAdminStats.activeCustomers),
          change: "",
          trend: "up" as const,
          icon: Users,
          color: "bg-blue-500",
          lightColor: "bg-blue-50",
        },
        {
          label: "Avg. Order Value",
          value: `₹${Math.round(superAdminStats.avgOrderValue).toLocaleString("en-IN")}`,
          change: "",
          trend: "up" as const,
          icon: TrendingUp,
          color: "bg-purple-500",
          lightColor: "bg-purple-50",
        },
      ]
    : []

  const pipelineStats = superAdminStats
    ? [
        {
          label: "Preparing",
          count: superAdminStats.pipeline.preparing,
          icon: ChefHat,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
        },
        {
          label: "Packed",
          count: superAdminStats.pipeline.packed,
          icon: Package,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
        {
          label: "Out for Delivery",
          count: superAdminStats.pipeline.outForDelivery,
          icon: Truck,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: isToday ? "Delivered Today" : "Delivered",
          count: superAdminStats.pipeline.deliveredInPeriod,
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50",
        },
      ]
    : []

  const highlightItems = superAdminStats
    ? [
        { label: "Peak Hour", value: superAdminStats.highlights.peakHour ?? "—" },
        { label: "Top Item", value: superAdminStats.highlights.topItem ?? "—" },
        {
          label: "Cancellation Rate",
          value: `${superAdminStats.highlights.cancellationRate}%`,
        },
        {
          label: "Avg. Prep Time",
          value:
            superAdminStats.highlights.avgPrepTimeMinutes != null
              ? `${superAdminStats.highlights.avgPrepTimeMinutes} min`
              : "—",
        },
      ]
    : []

  const kpiCards =
    isBranchManager && branchStatsLoading
      ? [
          { label: "Today's Orders", value: "...", icon: ShoppingBag, color: "bg-orange-500", lightColor: "bg-orange-50", change: "", trend: "up" as const },
          { label: "Today's Revenue", value: "...", icon: IndianRupee, color: "bg-emerald-500", lightColor: "bg-emerald-50", change: "", trend: "up" as const },
          { label: "Active Tickets", value: "...", icon: UtensilsCrossed, color: "bg-blue-500", lightColor: "bg-blue-50", change: "", trend: "up" as const },
          { label: "Kitchen Status", value: "...", icon: ChefHat, color: "bg-purple-500", lightColor: "bg-purple-50", change: "", trend: "up" as const },
        ]
      : isBranchManager
        ? [
            { label: "Today's Orders", value: String(liveStats?.totalOrdersToday ?? 0), icon: ShoppingBag, color: "bg-orange-500", lightColor: "bg-orange-50", change: "", trend: "up" as const },
            { label: "Today's Revenue", value: `₹${(liveStats?.totalRevenueToday ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-emerald-500", lightColor: "bg-emerald-50", change: "", trend: "up" as const },
            { label: "Active Tickets", value: String(liveStats?.activeTickets ?? 0), icon: UtensilsCrossed, color: "bg-blue-500", lightColor: "bg-blue-50", change: "", trend: "up" as const },
            {
              label: "Kitchen Status",
              value: liveStats?.kitchenStatus ?? "—",
              icon: ChefHat,
              color:
                liveStats?.kitchenStatus === "CLOSED" || liveStats?.kitchenStatus === "MAINTENANCE"
                  ? "bg-red-500"
                  : "bg-purple-500",
              lightColor:
                liveStats?.kitchenStatus === "CLOSED" || liveStats?.kitchenStatus === "MAINTENANCE"
                  ? "bg-red-50"
                  : "bg-purple-50",
              change: "",
              trend: "up" as const,
            },
          ]
        : superAdminLoading
          ? [
              { label: "Revenue", value: "...", icon: IndianRupee, color: "bg-emerald-500", lightColor: "bg-emerald-50", change: "", trend: "up" as const },
              { label: "Total Orders", value: "...", icon: ShoppingBag, color: "bg-orange-500", lightColor: "bg-orange-50", change: "", trend: "up" as const },
              { label: "Active Customers", value: "...", icon: Users, color: "bg-blue-500", lightColor: "bg-blue-50", change: "", trend: "up" as const },
              { label: "Avg. Order Value", value: "...", icon: TrendingUp, color: "bg-purple-500", lightColor: "bg-purple-50", change: "", trend: "up" as const },
            ]
          : superAdminKpis

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title={isBranchManager ? `Branch Dashboard${branchName ? ` — ${branchName}` : ""}` : "Dashboard"}
        subtitle={
          isBranchManager
            ? "Real-time operational view for your branch."
            : "Welcome back! Here's what's happening today."
        }
        dateFilter={
          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdminView && (
              <DashboardLocationFilters value={locationFilters} onChange={setLocationFilters} />
            )}
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {isSuperAdminView && superAdminError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load dashboard data.{" "}
            <button
              type="button"
              onClick={() => refetchSuperAdmin()}
              className="font-medium underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-gray-200/80 bg-white p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                  {stat.change ? (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change} vs previous period
                    </p>
                  ) : null}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.lightColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color.replace("bg-", "text-")}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {isBranchManager ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 rounded-2xl border border-gray-200/80 bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Kitchen Queue</h3>
                  <p className="text-sm text-gray-500">Live ticket counts for your branch</p>
                </div>
                <Link href="/kitchen" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                  Open Kitchen →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 p-6">
                {[
                  { label: "Pending", count: liveStats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
                  { label: "Preparing", count: liveStats?.preparingOrders ?? 0, icon: ChefHat, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Ready", count: liveStats?.readyOrders ?? 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                ].map((s) => (
                  <div key={s.label} className={`flex flex-col items-center justify-center rounded-xl ${s.bg} p-4`}>
                    <s.icon className={`h-6 w-6 ${s.color} mb-2`} />
                    <span className="text-2xl font-bold text-gray-900">{s.count}</span>
                    <span className="text-xs font-medium text-gray-600 mt-1">{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-2xl border border-gray-200/80 bg-white"
            >
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">Branch Info</h3>
                <p className="text-sm text-gray-500">Your assigned branch details</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Branch ID</span>
                  <span className="text-sm font-semibold text-gray-900">{user?.branchId?.slice(0, 12) ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      liveStats?.kitchenStatus === "OPEN"
                        ? "bg-green-50 text-green-700"
                        : liveStats?.kitchenStatus === "BUSY"
                          ? "bg-amber-50 text-amber-700"
                          : liveStats?.kitchenStatus === "CLOSED" || liveStats?.kitchenStatus === "MAINTENANCE"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        liveStats?.kitchenStatus === "OPEN"
                          ? "bg-green-500"
                          : liveStats?.kitchenStatus === "BUSY"
                            ? "bg-amber-500"
                            : liveStats?.kitchenStatus === "CLOSED" || liveStats?.kitchenStatus === "MAINTENANCE"
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }`}
                    />
                    {liveStats?.kitchenStatus ?? "Checking..."}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active Tickets</span>
                  <span className="text-sm font-semibold text-gray-900">{liveStats?.activeTickets ?? 0}</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:col-span-2 rounded-2xl border border-gray-200/80 bg-white"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Order Pipeline</h3>
                    <p className="text-sm text-gray-500">Current order status breakdown</p>
                  </div>
                  <Link href="/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                  {(superAdminLoading
                    ? [
                        { label: "Preparing", count: "—", icon: ChefHat, color: "text-yellow-600", bg: "bg-yellow-50" },
                        { label: "Packed", count: "—", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Out for Delivery", count: "—", icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: isToday ? "Delivered Today" : "Delivered", count: "—", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                      ]
                    : pipelineStats
                  ).map((stat) => (
                    <div
                      key={stat.label}
                      className={`flex flex-col items-center justify-center rounded-xl ${stat.bg} p-4 transition-transform hover:scale-105`}
                    >
                      <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
                      <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                      <span className="text-xs font-medium text-gray-600 mt-1 text-center">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-2xl border border-gray-200/80 bg-white"
              >
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-base font-semibold text-gray-900">Today&apos;s Highlights</h3>
                  <p className="text-sm text-gray-500">Key metrics at a glance</p>
                </div>
                <div className="p-6 space-y-4">
                  {(superAdminLoading
                    ? [
                        { label: "Peak Hour", value: "—" },
                        { label: "Top Item", value: "—" },
                        { label: "Cancellation Rate", value: "—" },
                        { label: "Avg. Prep Time", value: "—" },
                      ]
                    : highlightItems
                  ).map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="rounded-2xl border border-gray-200/80 bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
                  <p className="text-sm text-gray-500">Latest customer orders</p>
                </div>
                <Link href="/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                  View All →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Order</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Customer</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Items</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Total</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Time</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {superAdminLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          Loading recent orders...
                        </td>
                      </tr>
                    ) : superAdminStats?.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          No orders found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      superAdminStats?.recentOrders.map((order) => {
                        const statusKey = normalizeOrderStatus(order.status)
                        const style = statusStyles[statusKey] || statusStyles.pending
                        return (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-semibold text-gray-900">{order.orderNumber}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm text-gray-700">{order.customerName}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm text-gray-500">{order.itemCount} items</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{order.total.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {statusLabels[statusKey] ?? statusKey}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
