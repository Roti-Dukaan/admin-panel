"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useOrdersStore } from "../hooks/useOrders"
import type { OrderFilters as OrderFiltersType, OrderStatus, PaymentMethod, PaymentStatus, OrderType } from "../types/order"
import { Search, X } from "lucide-react"

const dateFilterOptions = [
  { label: "All Orders", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "this_week" },
]

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Preparing", value: "preparing" },
  { label: "Packed", value: "packed" },
  { label: "Out For Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

const paymentOptions = [
  { label: "All Methods", value: "all" },
  { label: "Cash on Delivery", value: "cod" },
  { label: "Online", value: "online" },
  { label: "Subscription", value: "subscription" },
]

const paymentStatusOptions = [
  { label: "All Payment Status", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
  { label: "COD Pending", value: "cod_pending" },
  { label: "COD Collected", value: "cod_collected" },
]

const orderTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "One Time", value: "one_time" },
  { label: "Subscription", value: "subscription" },
]

export function OrderFilters() {
  const { filters, setFilters } = useOrdersStore()

  const hasActiveFilters =
    filters.dateFilter !== "all" ||
    filters.status !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.orderType !== "all" ||
    filters.search !== ""

  const clearFilters = () => {
    setFilters({
      dateFilter: "all",
      status: "all",
      paymentMethod: "all",
      paymentStatus: "all",
      orderType: "all",
      search: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          options={dateFilterOptions}
          value={filters.dateFilter}
          onChange={(e) => setFilters({ dateFilter: e.target.value as OrderFiltersType["dateFilter"] })}
          className="w-[160px]"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as OrderStatus | "all" })}
          className="w-[180px]"
        />
        <Select
          options={paymentOptions}
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ paymentMethod: e.target.value as PaymentMethod | "all" })}
          className="w-[200px]"
        />
        <Select
          options={paymentStatusOptions}
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ paymentStatus: e.target.value as PaymentStatus | "all" })}
          className="w-[200px]"
        />
        <Select
          options={orderTypeOptions}
          value={filters.orderType}
          onChange={(e) => setFilters({ orderType: e.target.value as OrderType | "all" })}
          className="w-[160px]"
        />

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, Customer, Phone or Transaction ID..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
