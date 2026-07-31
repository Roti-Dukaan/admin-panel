import { apiClient } from "@/lib/api/http"
import type {
  SuperAdminDashboardFilters,
  SuperAdminDashboardStats,
} from "../types/dashboard"

export async function fetchSuperAdminDashboardStats(
  filters: SuperAdminDashboardFilters,
): Promise<SuperAdminDashboardStats> {
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

  const { data } = await apiClient.get<{ success: boolean; data: SuperAdminDashboardStats }>(
    "/admin/dashboard/stats",
    { params },
  )
  return data.data
}
