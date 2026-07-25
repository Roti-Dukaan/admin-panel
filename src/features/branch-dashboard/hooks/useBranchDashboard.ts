import { useQuery } from "@tanstack/react-query"
import { fetchBranchDashboardStats } from "../api/branch-dashboard.api"

/** Shared with BranchOrderAlertProvider for realtime invalidation. */
export const BRANCH_DASHBOARD_STATS_KEY = ["branch-dashboard", "stats"] as const

const REALTIME_STALE_MS = 5_000
/** Slow fallback when Socket.IO is offline; realtime invalidates this query. */
const FALLBACK_POLL_MS = 60_000

export function useBranchDashboard(enabled = true) {
  return useQuery({
    queryKey: BRANCH_DASHBOARD_STATS_KEY,
    queryFn: fetchBranchDashboardStats,
    staleTime: REALTIME_STALE_MS,
    refetchInterval: enabled ? FALLBACK_POLL_MS : 0,
    refetchIntervalInBackground: true,
    enabled,
  })
}
