"use client"

import * as React from "react"
import { motion } from "motion/react"
import { useBranchDashboard } from "../hooks/useBranchDashboard"
import { KitchenStatusToggle } from "@/features/kitchen-operations/KitchenStatusToggle"
import { Wallet, ShoppingBag, UtensilsCrossed, Clock, Truck, Package, Users, BarChart3 } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, subtitle, icon, trend, trendUp = true }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="rounded-xl p-3 bg-gray-50 text-gray-600">{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={trendUp ? "text-green-600" : "text-red-600"}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  )
}

function QuickActionCard({ title, description, icon, href }: { title: string; description: string; icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-gray-100/80 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl p-3 bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </a>
  )
}

export function BranchDashboardPage() {
  const { data, isLoading, error, refetch } = useBranchDashboard()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100/80 bg-white p-5">
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="mt-4 h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100/80 bg-white p-5">
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
              <div className="mt-2 h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load dashboard data</p>
        <button onClick={() => refetch()} className="mt-4 text-orange-600 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  const stats = data

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Orders"
          value={stats?.totalOrdersToday ?? 0}
          subtitle="All orders"
          icon={<ShoppingBag className="h-6 w-6" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${(stats?.totalRevenueToday ?? 0).toLocaleString()}`}
          subtitle="Total sales"
          icon={<Wallet className="h-6 w-6" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Live Tickets"
          value={stats?.activeTickets ?? 0}
          subtitle="In kitchen"
          icon={<UtensilsCrossed className="h-6 w-6" />}
          trend={stats?.activeTickets ? `${stats.activeTickets} active` : "No active tickets"}
          trendUp={true}
        />
        <KitchenStatusToggle />
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Kitchen"
            description="Manage live orders"
            icon={<UtensilsCrossed className="h-5 w-5" />}
            href="/branch/kitchen"
          />
          <QuickActionCard
            title="Production"
            description="Plan production runs"
            icon={<Package className="h-5 w-5" />}
            href="/branch/production"
          />
          <QuickActionCard
            title="Inventory"
            description="Update availability"
            icon={<Package className="h-5 w-5" />}
            href="/branch/inventory"
          />
          <QuickActionCard
            title="Deliveries"
            description="Track deliveries"
            icon={<Truck className="h-5 w-5" />}
            href="/branch/delivery"
          />
        </div>
      </div>

      {/* Recent Orders Summary */}
      <div className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Summary</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">{stats?.totalOrdersToday ?? 0}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">{stats?.preparingOrders ?? 0}</p>
            <p className="text-xs text-gray-500">Preparing</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">{stats?.readyOrders ?? 0}</p>
            <p className="text-xs text-gray-500">Ready</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">{stats?.outForDelivery ?? 0}</p>
            <p className="text-xs text-gray-500">Out for Delivery</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">{stats?.deliveredToday ?? 0}</p>
            <p className="text-xs text-gray-500">Delivered</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">{stats?.cancelledToday ?? 0}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Placeholder */}
      <div className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (7 Days)</h2>
        <div className="h-64 flex items-end justify-around gap-2">
          {(stats?.revenueTrend ?? []).map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t bg-gradient-to-t from-orange-500 to-orange-400 transition-all hover:from-orange-600 hover:to-orange-500"
                style={{ height: `${Math.max((day.revenue / (stats?.maxRevenue ?? 1)) * 100, 4)}%`, minHeight: "20px" }}
              />
              <p className="mt-2 text-xs text-gray-500">{day.day}</p>
              <p className="text-xs font-medium text-gray-900">₹{day.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}