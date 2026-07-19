import axios from "axios";
import type {
  Delivery,
  DeliveryListEntity,
  DeliveryFilters,
  DeliveryStatistics,
  DeliveryStatus,
} from "../types/delivery";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const deliveryApi = {
  list: async (filters: DeliveryFilters = {}): Promise<DeliveryListEntity> => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.provider && filters.provider !== "all") params.append("provider", filters.provider);
    if (filters.orderId) params.append("orderId", filters.orderId);
    if (filters.customerId) params.append("customerId", filters.customerId);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.search) params.append("search", filters.search);
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    const { data } = await api.get<{ success: boolean; data: DeliveryListEntity }>(
      `/admin/deliveries?${params.toString()}`
    );
    return data.data;
  },

  getById: async (id: string): Promise<Delivery> => {
    const { data } = await api.get<{ success: boolean; data: Delivery }>(`/admin/deliveries/${id}`);
    return data.data;
  },

  getByOrderId: async (orderId: string): Promise<Delivery> => {
    const { data } = await api.get<{ success: boolean; data: Delivery }>(`/admin/deliveries/order/${orderId}`);
    return data.data;
  },

  updateStatus: async (id: string, status: DeliveryStatus, remarks?: string): Promise<Delivery> => {
    const { data } = await api.patch<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/status`,
      { status, remarks }
    );
    return data.data;
  },

  cancel: async (id: string, reason: string): Promise<Delivery> => {
    const { data } = await api.post<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/cancel`,
      { reason }
    );
    return data.data;
  },

  refresh: async (id: string): Promise<Delivery> => {
    const { data } = await api.post<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/refresh`
    );
    return data.data;
  },

  retry: async (id: string): Promise<Delivery> => {
    const { data } = await api.post<{ success: boolean; data: Delivery }>(
      `/admin/deliveries/${id}/retry`
    );
    return data.data;
  },

  getStats: async (): Promise<DeliveryStatistics> => {
    const { data } = await api.get<{ success: boolean; data: DeliveryStatistics }>("/admin/deliveries/stats");
    return data.data;
  },
};