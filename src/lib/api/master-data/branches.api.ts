import { apiClient } from '../http';

export type BranchStatus = 'OPEN' | 'BUSY' | 'CLOSED' | 'MAINTENANCE';

export interface Branch {
  id: string;
  cityId: string;
  areaId: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
  formattedAddress?: string;
  placeId?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  status: BranchStatus;
  isActive: boolean;
  deliveryRadiusKm?: number;
  deliveryCharge?: number;
  minimumOrderAmount?: number;
  estimatedDeliveryTime?: number;
  allowScheduledOrders: boolean;
  allowSubscriptions: boolean;
  createdAt: string;
  updatedAt: string;
  city?: { id: string; name: string; code: string };
  area?: { id: string; name: string };
  admins?: { id: string; name: string; email: string }[];
}

export interface DeliverySettings {
  deliveryRadiusKm?: number;
  deliveryCharge?: number;
  minimumOrderAmount?: number;
  estimatedDeliveryTime?: number;
  allowScheduledOrders: boolean;
  allowSubscriptions: boolean;
  latitude: number;
  longitude: number;
  name: string;
}

export interface CreateBranchDTO {
  name: string;
  code: string;
  cityId: string;
  areaId: string;
  phone?: string;
  email?: string;
  address?: string;
  formattedAddress?: string;
  placeId?: string;
  pincode?: string;
  deliveryRadiusKm?: number;
  status?: BranchStatus;
  isActive?: boolean;
}

export interface UpdateBranchDTO {
  name?: string;
  code?: string;
  cityId?: string;
  areaId?: string;
  phone?: string;
  email?: string;
  address?: string;
  formattedAddress?: string;
  placeId?: string;
  pincode?: string;
  deliveryRadiusKm?: number;
  status?: BranchStatus;
  isActive?: boolean;
}

export interface UpdateDeliverySettingsDTO {
  deliveryRadiusKm?: number;
  deliveryCharge?: number;
  minimumOrderAmount?: number;
  estimatedDeliveryTime?: number;
  allowScheduledOrders?: boolean;
  allowSubscriptions?: boolean;
}

export interface BranchFilters {
  search?: string;
  cityId?: string;
  areaId?: string;
  status?: BranchStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const branchesApi = {
  list: (params?: BranchFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Branch>>>('/admin/branches', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Branch>>(`/admin/branches/${id}`),

  create: (data: CreateBranchDTO) =>
    apiClient.post<ApiResponse<Branch>>('/admin/branches', data),

  update: (id: string, data: UpdateBranchDTO) =>
    apiClient.patch<ApiResponse<Branch>>(`/admin/branches/${id}`, data),

  archive: (id: string) =>
    apiClient.patch<ApiResponse<Branch>>(`/admin/branches/${id}/archive`),

  getDeliverySettings: (id: string) =>
    apiClient.get<ApiResponse<DeliverySettings>>(`/admin/branches/${id}/delivery-settings`),

  updateDeliverySettings: (id: string, data: UpdateDeliverySettingsDTO) =>
    apiClient.patch<ApiResponse<Branch>>(`/admin/branches/${id}/delivery-settings`, data),
};
