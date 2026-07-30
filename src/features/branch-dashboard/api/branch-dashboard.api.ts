import { apiClient } from "@/lib/api/http"
import type { BranchDashboardStats } from "../types/dashboard"

export async function fetchBranchDashboardStats(): Promise<BranchDashboardStats> {
  const { data } = await apiClient.get<{ success: boolean; data: BranchDashboardStats }>(
    "/admin/branch-dashboard/stats"
  )
  return data.data
}
