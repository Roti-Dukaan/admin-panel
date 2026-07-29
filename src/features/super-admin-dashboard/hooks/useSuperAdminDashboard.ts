import { useQuery } from "@tanstack/react-query"
import { fetchSuperAdminDashboardStats } from "../api/admin-dashboard.api"
import type { SuperAdminDashboardFilters } from "../types/dashboard"

export const SUPER_ADMIN_DASHBOARD_STATS_KEY = "super-admin-dashboard-stats"

export function useSuperAdminDashboard(
  filters: SuperAdminDashboardFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: [SUPER_ADMIN_DASHBOARD_STATS_KEY, filters],
    queryFn: () => fetchSuperAdminDashboardStats(filters),
    staleTime: 30_000,
    enabled,
  })
}
