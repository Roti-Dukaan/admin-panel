import { apiClient } from "./http";

interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderType?: string;
  search?: string;
  dateFilter?: string;
}

export const ordersApi = {
  list: async (params: OrderListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));
    if (params.status && params.status !== "all") queryParams.set("status", params.status);
    if (params.paymentMethod && params.paymentMethod !== "all") queryParams.set("paymentMethod", params.paymentMethod);
    if (params.paymentStatus && params.paymentStatus !== "all") queryParams.set("paymentStatus", params.paymentStatus);
    if (params.orderType && params.orderType !== "all") queryParams.set("orderType", params.orderType);
    if (params.search) queryParams.set("search", params.search);

    const { data } = await apiClient.get<{ success: boolean; data: { items: unknown[]; total: number; page: number; limit: number } }>(
      `/admin/orders?${queryParams.toString()}`
    );
    return data.data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: unknown }>("/admin/orders/stats");
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: unknown }>(`/admin/orders/${id}`);
    return data.data;
  },

  updateStatus: async (id: string, dto: { status: string; remarks?: string }) => {
    const { data } = await apiClient.patch<{ success: boolean; data: unknown }>(`/admin/orders/${id}/status`, dto);
    return data.data;
  },
};