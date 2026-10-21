import { apiClient } from "@/lib/api/http";
import type { ApiResponse } from "@/lib/types/api";
import type {
  NotifyServiceableResult,
  ServiceWaitlistFilters,
  ServiceWaitlistListResponse,
} from "./types";

export const serviceWaitlistApi = {
  list: async (filters: Partial<ServiceWaitlistFilters> = {}): Promise<ServiceWaitlistListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.search?.trim()) params.set("search", filters.search.trim());

    const { data } = await apiClient.get<ApiResponse<ServiceWaitlistListResponse>>(
      `/admin/service-waitlist?${params.toString()}`,
    );
    return data.data;
  },

  notifyServiceable: async (): Promise<NotifyServiceableResult> => {
    const { data } = await apiClient.post<ApiResponse<NotifyServiceableResult>>(
      "/admin/service-waitlist/notify-serviceable",
    );
    return data.data;
  },
};
