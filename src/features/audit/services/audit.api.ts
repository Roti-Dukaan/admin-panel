import { apiClient } from "@/lib/api/http";
import type { AuditLogListResponse, AuditLogStats, AuditLogFilters } from "../types/audit";

export const auditApi = {
  list: async (filters: Partial<AuditLogFilters> = {}): Promise<AuditLogListResponse> => {
    const params = new URLSearchParams();
    if (filters.entity && filters.entity !== "all") params.append("entity", filters.entity);
    if (filters.adminId && filters.adminId !== "all") params.append("adminId", filters.adminId);
    if (filters.action && filters.action !== "all") params.append("action", filters.action);
    if (filters.search) params.append("search", filters.search);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 50).toString());

    const { data } = await apiClient.get<{ success: boolean; data: AuditLogListResponse }>(
      `/admin/audit-logs?${params.toString()}`
    );
    return data.data;
  },

  getStats: async (): Promise<AuditLogStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: AuditLogStats }>("/admin/audit-logs/stats");
    return data.data;
  },
};
