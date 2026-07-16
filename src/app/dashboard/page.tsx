"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { motion } from "motion/react"
import {
  ShoppingBag,
  IndianRupee,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  Package,
  MoreHorizontal,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { KitchenOperationsCard } from "@/features/kitchen-operations/KitchenOperationsCard"

const stats = [
  {
    label: "Today's Revenue",
    value: "₹12,450",
    change: "+12.5%",
    trend: "up" as const,
    icon: IndianRupee,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
  },
  {
    label: "Total Orders",
    value: "48",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingBag,
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
  },
  {
    label: "Active Customers",
    value: "156",
    change: "+3.1%",
    trend: "up" as const,
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
  },
  {
    label: "Avg. Order Value",
    value: "₹259",
    change: "-2.4%",
    trend: "down" as const,
    icon: TrendingUp,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
  },
]

const orderStats = [
  { label: "Preparing", count: 8, icon: ChefHat, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Packed", count: 5, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Out for Delivery", count: 12, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Delivered Today", count: 23, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
]

const recentOrders = [
  { id: "#ORD-1234", customer: "Rahul Sharma", items: 3, total: "₹420", status: "preparing", time: "2 min ago" },
  { id: "#ORD-1233", customer: "Priya Patel", items: 5, total: "₹780", status: "out-for-delivery", time: "8 min ago" },
  { id: "#ORD-1232", customer: "Amit Kumar", items: 2, total: "₹310", status: "delivered", time: "15 min ago" },
  { id: "#ORD-1231", customer: "Sneha Gupta", items: 4, total: "₹560", status: "packed", time: "18 min ago" },
  { id: "#ORD-1230", customer: "Vikram Singh", items: 1, total: "₹180", status: "pending-confirmation", time: "22 min ago" },
]

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "pending-confirmation": { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  pending: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  preparing: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  packed: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "ready-for-pickup": { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  "out-for-delivery": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
}

const statusLabels: Record<string, string> = {
  "pending-confirmation": "Pending",
  confirmed: "Confirmed",
  pending: "Pending",
  preparing: "Preparing",
  packed: "Packed",
  "ready-for-pickup": "Ready for Pickup",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
}

const todayHighlights = [
  { label: "Peak Hour", value: "12:00 PM – 2:00 PM" },
  { label: "Top Item", value: "Jonna Roti" },
  { label: "Cancellation Rate", value: "2.1%" },
  { label: "Avg. Prep Time", value: "18 min" },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
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
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.lightColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color.replace("bg-", "text-")}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-400">vs yesterday</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Kitchen Operations — global status control */}
        <KitchenOperationsCard compact />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Order Status */}
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
              {orderStats.map((stat, i) => (
                <div key={stat.label} className={`flex flex-col items-center justify-center rounded-xl ${stat.bg} p-4 transition-transform hover:scale-105`}>
                  <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
                  <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                  <span className="text-xs font-medium text-gray-600 mt-1 text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Today's Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl border border-gray-200/80 bg-white"
          >
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Today's Highlights</h3>
              <p className="text-sm text-gray-500">Key metrics at a glance</p>
            </div>
            <div className="p-6 space-y-4">
              {todayHighlights.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
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
                {recentOrders.map((order) => {
                  const style = statusStyles[order.status] || statusStyles.pending
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">{order.id}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-gray-700">{order.customer}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-gray-500">{order.items} items</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">{order.total}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {order.time}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
