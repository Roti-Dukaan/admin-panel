import { apiClient } from '../http';

export interface Area {
  id: string;
  cityId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  city?: { id: string; name: string; code: string };
}

export interface CreateAreaDTO {
  name: string;
  cityId: string;
  isActive?: boolean;
}

export interface UpdateAreaDTO {
  name?: string;
  cityId?: string;
  isActive?: boolean;
}

export interface AreaFilters {
  search?: string;
  cityId?: string;
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

export const areasApi = {
  list: (params?: AreaFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Area>>>('/admin/areas', { params }),

  getByCityId: (cityId: string) =>
    apiClient.get<ApiResponse<Area[]>>(`/admin/areas/by-city/${cityId}`),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Area>>(`/admin/areas/${id}`),

  create: (data: CreateAreaDTO) =>
    apiClient.post<ApiResponse<Area>>('/admin/areas', data),

  update: (id: string, data: UpdateAreaDTO) =>
    apiClient.patch<ApiResponse<Area>>(`/admin/areas/${id}`, data),

  archive: (id: string) =>
    apiClient.patch<ApiResponse<Area>>(`/admin/areas/${id}/archive`),
};
