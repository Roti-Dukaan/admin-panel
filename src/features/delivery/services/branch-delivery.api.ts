import { apiClient } from "@/lib/api/http";
import type {
  Delivery,
  DeliveryListEntity,
  DeliveryFilters,
  DeliveryStatistics,
  DeliveryDashboard,
} from "../types/delivery";

function buildListParams(filters: DeliveryFilters = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  if (filters.provider && filters.provider !== "all") params.append("provider", filters.provider);
  if (filters.deliveryType && filters.deliveryType !== "all") params.append("deliveryType", filters.deliveryType);
  if (filters.orderId) params.append("orderId", filters.orderId);
  if (filters.customerId) params.append("customerId", filters.customerId);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);
  if (filters.search) params.append("search", filters.search);
  params.append("page", (filters.page || 1).toString());
  params.append("limit", (filters.limit || 10).toString());
  return params;
}

export const branchDeliveryApi = {
  list: async (filters: DeliveryFilters = {}): Promise<DeliveryListEntity> => {
    const { data } = await apiClient.get<{ success: boolean; data: DeliveryListEntity }>(
      `/branch-manager/deliveries?${buildListParams(filters).toString()}`
    );
    return data.data;
  },

  getById: async (id: string): Promise<Delivery> => {
    const { data } = await apiClient.get<{ success: boolean; data: Delivery }>(
      `/branch-manager/deliveries/${id}`
    );
    return data.data;
  },

  getStats: async (): Promise<DeliveryStatistics> => {
    const { data } = await apiClient.get<{ success: boolean; data: DeliveryStatistics }>(
      "/branch-manager/deliveries/stats"
    );
    return data.data;
  },

  getDashboard: async (branchId?: string): Promise<DeliveryDashboard> => {
    const params = branchId ? { branchId } : undefined;
    const { data } = await apiClient.get<{ success: boolean; data: DeliveryDashboard }>(
      "/branch-manager/deliveries/dashboard",
      { params },
    );
    return data.data;
  },
};
