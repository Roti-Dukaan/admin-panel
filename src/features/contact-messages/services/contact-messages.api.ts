import { apiClient } from "@/lib/api/http";
import type { ApiResponse } from "@/lib/types/api";
import type {
  ContactMessage,
  ContactMessageFilters,
  ContactMessageListResponse,
  ContactMessageStatus,
} from "../types/contact-message";

export const contactMessagesApi = {
  list: async (filters: Partial<ContactMessageFilters> = {}): Promise<ContactMessageListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.search?.trim()) params.set("search", filters.search.trim());

    const { data } = await apiClient.get<ApiResponse<ContactMessageListResponse>>(
      `/admin/contact-messages?${params.toString()}`,
    );
    return data.data;
  },

  getById: async (id: string): Promise<ContactMessage> => {
    const { data } = await apiClient.get<ApiResponse<ContactMessage>>(
      `/admin/contact-messages/${id}`,
    );
    return data.data;
  },

  updateStatus: async (id: string, status: ContactMessageStatus): Promise<ContactMessage> => {
    const { data } = await apiClient.patch<ApiResponse<ContactMessage>>(
      `/admin/contact-messages/${id}`,
      { status },
    );
    return data.data;
  },
};
