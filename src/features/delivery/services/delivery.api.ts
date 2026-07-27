import { apiClient } from "@/lib/api/http";
import type {
  Delivery,
  DeliveryListEntity,
  DeliveryFilters,
  DeliveryStatistics,
  DeliveryDashboard,
  DeliveryStatus,
} from "../types/delivery";

export const deliveryApi = {
  list: async (filters: DeliveryFilters = {}): Promise<DeliveryListEntity> => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.provider && filters.provider !== "all") params.append("provider", filters.provider);
    if (filters.deliveryType && filters.deliveryType !== "all") params.append("deliveryType", filters.deliveryType);
    if (filters.orderId) params.append("orderId", filters.orderId);
    if (filters.customerId) params.append("customerId", filters.customerId);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.search) params.append("search", filters.search);
    if (filters.branchId) params.append("branchId", filters.branchId);
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const { data } = await apiClient.get<{ success: boolean; data: DeliveryListEntity }>(
      `/admin/deliveries?${params.toString()}`
    );
    return data.data;
  },

  getById: async (id: string): Promise<Delivery> => {
    const { data } = await apiClient.get<{ success: boolean; data: Delivery }>(`/admin/deliveries/${id}`);
    return data.data;
  },

  getByOrderId: async (orderId: string): Promise<Delivery> => {
    const { data } = await apiClient.get<{ success: boolean; data: Delivery }>(`/admin/deliveries/order/${orderId}`);
    return data.data;
  },

  updateStatus: async (id: string, status: DeliveryStatus, remarks?: string): Promise<Delivery> => {
    const { data } = await apiClient.patch<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/status`,
      { status, remarks }
    );
    return data.data;
  },

  cancel: async (id: string, reason: string): Promise<Delivery> => {
    const { data } = await apiClient.post<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/cancel`,
      { reason }
    );
    return data.data;
  },

  refresh: async (id: string): Promise<Delivery> => {
    const { data } = await apiClient.post<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/refresh`
    );
    return data.data;
  },

  retry: async (id: string): Promise<Delivery> => {
    const { data } = await apiClient.post<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/retry`
    );
    return data.data;
  },

  getStats: async (branchId?: string): Promise<DeliveryStatistics> => {
    const params = branchId ? { branchId } : undefined;
    const { data } = await apiClient.get<{ success: boolean; data: DeliveryStatistics }>(
      "/admin/deliveries/stats",
      { params },
    );
    return data.data;
  },

  getDashboard: async (branchId?: string): Promise<DeliveryDashboard> => {
    const params = branchId ? { branchId } : undefined;
    const { data } = await apiClient.get<{ success: boolean; data: DeliveryDashboard }>(
      "/admin/deliveries/dashboard",
      { params },
    );
    return data.data;
  },
};
