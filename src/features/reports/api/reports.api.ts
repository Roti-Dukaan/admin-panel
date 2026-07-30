import { apiClient } from "@/lib/api/http"
import type { ReportsData, RevenueDataPoint, DateRange } from "../types/report"

export interface ReportsFilters {
  datePreset: DateRange
  startDate?: string
  endDate?: string
  cityId?: string
  areaId?: string
  branchId?: string
}

export interface ReportsApiResponse extends ReportsData {
  meta?: {
    datePreset: string
    periodStart: string
    periodEnd: string
    revenueChangePercent: number | null
    ordersChangePercent: number | null
  }
}

export async function fetchReports(filters: ReportsFilters): Promise<ReportsApiResponse> {
  const params: Record<string, string> = {
    datePreset: filters.datePreset,
  }

  if (filters.datePreset === "custom") {
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
  }
  if (filters.cityId) params.cityId = filters.cityId
  if (filters.areaId) params.areaId = filters.areaId
  if (filters.branchId) params.branchId = filters.branchId

  const { data } = await apiClient.get<{ success: boolean; data: ReportsApiResponse }>(
    "/admin/dashboard/reports",
    { params },
  )
  return data.data
}

export function aggregateWeekly(points: RevenueDataPoint[]): RevenueDataPoint[] {
  if (points.length === 0) return []
  const weeks: RevenueDataPoint[] = []
  for (let i = 0; i < points.length; i += 7) {
    const chunk = points.slice(i, i + 7)
    const revenue = chunk.reduce((s, p) => s + p.revenue, 0)
    const orders = chunk.reduce((s, p) => s + p.orders, 0)
    weeks.push({
      date: chunk[0].date,
      label: `Week ${weeks.length + 1}`,
      revenue,
      orders,
      avgOrderValue: orders > 0 ? Math.round(revenue / orders) : 0,
    })
  }
  return weeks
}

export function aggregateMonthly(points: RevenueDataPoint[]): RevenueDataPoint[] {
  const map = new Map<string, RevenueDataPoint>()
  for (const point of points) {
    const monthKey = point.date.slice(0, 7)
    const existing = map.get(monthKey) ?? {
      date: `${monthKey}-01`,
      label: new Date(`${monthKey}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      revenue: 0,
      orders: 0,
      avgOrderValue: 0,
    }
    existing.revenue += point.revenue
    existing.orders += point.orders
    map.set(monthKey, existing)
  }
  return [...map.values()].map((p) => ({
    ...p,
    avgOrderValue: p.orders > 0 ? Math.round(p.revenue / p.orders) : 0,
  }))
}
