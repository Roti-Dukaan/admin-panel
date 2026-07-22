import { apiClient } from './http';

export interface KitchenLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  deliveryCharge: number;
  estimatedDeliveryTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKitchenLocationDTO {
  name: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  deliveryCharge: number;
  estimatedDeliveryTime?: string;
  isActive?: boolean;
}

export interface UpdateKitchenLocationDTO {
  name?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
  deliveryCharge?: number;
  estimatedDeliveryTime?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const kitchenLocationApi = {
  getAll: () =>
    apiClient.get<ApiResponse<KitchenLocation[]>>('/admin/kitchen-locations'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<KitchenLocation>>(`/admin/kitchen-locations/${id}`),

  create: (data: CreateKitchenLocationDTO) =>
    apiClient.post<ApiResponse<KitchenLocation>>('/admin/kitchen-locations', data),

  update: (id: string, data: UpdateKitchenLocationDTO) =>
    apiClient.patch<ApiResponse<KitchenLocation>>(`/admin/kitchen-locations/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<KitchenLocation>>(`/admin/kitchen-locations/${id}`),

  getDefault: () =>
    apiClient.get<ApiResponse<KitchenLocation>>('/admin/kitchen-locations/default'),
};
