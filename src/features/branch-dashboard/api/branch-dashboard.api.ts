import { apiClient } from "@/lib/api/http"
import type { BranchDashboardStats } from "../types/dashboard"

export async function fetchBranchDashboardStats(): Promise<{ success: boolean; data: BranchDashboardStats }> {
  const res = await apiClient.get("/admin/branch-dashboard/stats")
  return res
}
