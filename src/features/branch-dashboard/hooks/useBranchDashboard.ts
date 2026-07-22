import { useQuery } from "@tanstack/react-query"
import { fetchBranchDashboardStats } from "../api/branch-dashboard.api"

export function useBranchDashboard() {
  return useQuery({
    queryKey: ["branch-dashboard", "stats"],
    queryFn: fetchBranchDashboardStats,
    refetchInterval: 30_000,
  })
}
