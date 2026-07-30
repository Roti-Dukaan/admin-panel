"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useOrdersStore } from "../hooks/useOrders"
import type { OrderFilters as OrderFiltersType, OrderStatus, PaymentMethod, PaymentStatus, OrderType } from "../types/order"
import { branchesApi } from "@/lib/api/master-data/branches.api"
import { citiesApi } from "@/lib/api/master-data/cities.api"
import { areasApi } from "@/lib/api/master-data/areas.api"
import type { Branch } from "@/lib/api/master-data/branches.api"
import type { City } from "@/lib/api/master-data/cities.api"
import type { Area } from "@/lib/api/master-data/areas.api"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { Search, X } from "lucide-react"

function unwrapPaginatedList<T>(response: { data?: { data?: { items?: T[] } | T[] } }): T[] {
  const payload = response.data?.data
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  return []
}

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending Confirmation", value: "pending-confirmation" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Preparing", value: "preparing" },
  { label: "Packed", value: "packed" },
  { label: "Ready for Pickup", value: "ready-for-pickup" },
  { label: "Out For Delivery", value: "out-for-delivery" },
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
  const { isBranchManager } = useWorkspace()
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [cities, setCities] = React.useState<City[]>([])
  const [areas, setAreas] = React.useState<Area[]>([])

  React.useEffect(() => {
    if (isBranchManager) return

    branchesApi
      .list()
      .then((res) => setBranches(unwrapPaginatedList(res)))
      .catch(() => setBranches([]))
    citiesApi
      .list()
      .then((res) => setCities(unwrapPaginatedList(res)))
      .catch(() => setCities([]))
    areasApi
      .list()
      .then((res) => setAreas(unwrapPaginatedList(res)))
      .catch(() => setAreas([]))
  }, [isBranchManager])

  const hasActiveFilters =
    filters.dateFilter !== "all" ||
    filters.status !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.orderType !== "all" ||
    filters.search !== "" ||
    filters.branchId !== "" && filters.branchId !== "all" ||
    filters.cityId !== "" && filters.cityId !== "all" ||
    filters.areaId !== "" && filters.areaId !== "all"

  const clearFilters = () => {
    setFilters({
      dateFilter: "all",
      customStartDate: "",
      customEndDate: "",
      status: "all",
      paymentMethod: "all",
      paymentStatus: "all",
      orderType: "all",
      search: "",
      branchId: "all",
      cityId: "all",
      areaId: "all",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[180px]">
          <Select value={filters.status} onValueChange={(v) => setFilters({ status: v as OrderStatus | "all" })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={filters.paymentMethod} onValueChange={(v) => setFilters({ paymentMethod: v as PaymentMethod | "all" })}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              {paymentOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={filters.paymentStatus} onValueChange={(v) => setFilters({ paymentStatus: v as PaymentStatus | "all" })}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[160px]">
          <Select value={filters.orderType} onValueChange={(v) => setFilters({ orderType: v as OrderType | "all" })}>
            <SelectTrigger>
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              {orderTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

      {!isBranchManager && (
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[200px]">
          <Select
            value={filters.branchId || "all"}
            onValueChange={(v) => setFilters({ branchId: v === "all" ? "all" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[180px]">
          <Select
            value={filters.cityId || "all"}
            onValueChange={(v) => setFilters({ cityId: v === "all" ? "all" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[180px]">
          <Select
            value={filters.areaId || "all"}
            onValueChange={(v) => setFilters({ areaId: v === "all" ? "all" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      )}
    </div>
  )
}