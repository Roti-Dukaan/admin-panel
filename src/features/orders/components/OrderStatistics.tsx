"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrdersStore } from "../hooks/useOrders"
import {
  ShoppingBag,
  ChefHat,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react"

const stats = [
  { key: "todayOrders" as const, label: "Today's Orders", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "preparing" as const, label: "Preparing", icon: ChefHat, color: "text-yellow-600", bg: "bg-yellow-50" },
  { key: "packed" as const, label: "Packed", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "outForDelivery" as const, label: "Out for Delivery", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "delivered" as const, label: "Delivered", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { key: "cancelled" as const, label: "Cancelled", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function OrderStatistics() {
  const { statistics, statisticsLoading } = useOrdersStore()

  if (statisticsLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const values = statistics
    ? stats.map((s) => ({ ...s, value: statistics[s.key] }))
    : stats.map((s) => ({ ...s, value: 0 }))

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
      {values.map((stat) => (
        <Card key={stat.key} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`rounded-lg p-1.5 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground truncate">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg p-1.5 bg-emerald-50">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate">
              Revenue Today
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(statistics?.totalRevenueToday ?? 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
