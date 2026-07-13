import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: `${API_BASE}/v1`,
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

interface KitchenTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "DISPATCHED" | "CANCELLED";
  estimatedPreparationMinutes?: number;
  startedAt?: string;
  readyAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    customer?: {
      id: string;
      fullName: string;
      name: string;
      phone: string;
    };
    deliverySlot?: {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
    };
    estimatedPreparationTime?: number;
    createdAt: string;
  } | null;
  items: Array<{
    id: string;
    foodNameSnapshot: string;
    quantity: number;
    categorySnapshot: string;
  }>;
  timeline: Array<{
    id: string;
    status: string;
    remarks?: string;
    createdByType: string;
    createdById: string;
    createdAt: string;
  }>;
}

interface KitchenListResponse {
  items: KitchenTicket[];
  total: number;
  page: number;
  limit: number;
}

export const kitchenApi = {
  list: async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    orderId?: string;
    search?: string;
  }): Promise<KitchenListResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.orderId) params.append("orderId", filters.orderId);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.search) params.append("search", filters.search);
    params.append("page", String(filters?.page || 1));
    params.append("limit", String(filters?.limit || 20));

    const { data } = await api.get<{ success: boolean; data: KitchenListResponse }>(
      `/admin/kitchen/list?${params.toString()}`
    );
    return data.data;
  },

  getKanban: async () => {
    const { data } = await api.get<{ success: boolean; data: any }>(
      "/admin/kitchen"
    );
    return data.data;
  },

  getById: async (id: string): Promise<KitchenTicket> => {
    const { data } = await api.get<{ success: boolean; data: KitchenTicket }>(
      `/admin/kitchen/${id}`
    );
    return data.data;
  },

  getByOrderId: async (orderId: string): Promise<KitchenTicket> => {
    const { data } = await api.get<{ success: boolean; data: KitchenTicket }>(
      `/admin/kitchen/order/${orderId}`
    );
    return data.data;
  },

  updateStatus: async (id: string, dto: { status: string; remarks?: string }): Promise<KitchenTicket> => {
    const { data } = await api.patch<{ success: boolean; data: KitchenTicket }>(
      `/admin/kitchen/${id}/status`,
      dto
    );
    return data.data;
  },

  updatePriority: async (id: string, dto: { priority: string }): Promise<KitchenTicket> => {
    const { data } = await api.patch<{ success: boolean; data: KitchenTicket }>(
      `/admin/kitchen/${id}/priority`,
      dto
    );
    return data.data;
  },

  cancel: async (id: string): Promise<KitchenTicket> => {
    const { data } = await api.post<{ success: boolean; data: KitchenTicket }>(
      `/admin/kitchen/${id}/cancel`
    );
    return data.data;
  },

  getTimeline: async (id: string): Promise<KitchenTicket[]> => {
    const { data } = await api.get<{ success: boolean; data: KitchenTicket[] }>(
      `/admin/kitchen/${id}/timeline`
    );
    return data.data;
  },
};