import type { DateRangePreset } from "@/components/shared/DateRangeFilter"

export interface SuperAdminDashboardFilters {
  datePreset: DateRangePreset
  startDate?: string
  endDate?: string
  cityId?: string
  areaId?: string
  branchId?: string
}

export interface SuperAdminDashboardPipeline {
  preparing: number
  packed: number
  outForDelivery: number
  deliveredInPeriod: number
}

export interface SuperAdminDashboardHighlights {
  peakHour: string | null
  topItem: string | null
  cancellationRate: number
  avgPrepTimeMinutes: number | null
}

export interface SuperAdminRecentOrder {
  id: string
  orderNumber: string
  customerName: string
  itemCount: number
  total: number
  status: string
  createdAt: string
}

export interface SuperAdminDashboardStats {
  totalRevenue: number
  totalOrders: number
  activeCustomers: number
  avgOrderValue: number
  revenueChangePercent: number | null
  ordersChangePercent: number | null
  pipeline: SuperAdminDashboardPipeline
  highlights: SuperAdminDashboardHighlights
  recentOrders: SuperAdminRecentOrder[]
  datePreset: string
  periodStart: string
  periodEnd: string
}
