import { apiClient } from "./http";

export interface DeliverySlot {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  cutoffMinutes: number;
  maxOrders: number;
  displayOrder: number;
  isActive: boolean;
  isAcceptingOrders: boolean;
  createdAt: string;
  updatedAt: string;
}

export const deliverySlotsApi = {
  list: async () => {
    const response = await apiClient.get("/admin/delivery-slots");
    return response.data.data as DeliverySlot[];
  },

  create: async (data: Omit<DeliverySlot, "id" | "createdAt" | "updatedAt">) => {
    const response = await apiClient.post("/admin/delivery-slots", data);
    return response.data.data as DeliverySlot;
  },

  update: async (id: string, data: Partial<Omit<DeliverySlot, "id" | "createdAt" | "updatedAt">>) => {
    const response = await apiClient.patch(`/admin/delivery-slots/${id}`, data);
    return response.data.data as DeliverySlot;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/admin/delivery-slots/${id}`);
  },
};