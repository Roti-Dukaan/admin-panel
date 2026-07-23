import { useQuery } from "@tanstack/react-query"
import { fetchBranchDashboardStats } from "../api/branch-dashboard.api"

export function useBranchDashboard(enabled = true) {
  return useQuery({
    queryKey: ["branch-dashboard", "stats"],
    queryFn: fetchBranchDashboardStats,
    refetchInterval: enabled ? 30_000 : 0,
    enabled,
  })
}
