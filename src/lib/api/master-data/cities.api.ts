import { apiClient } from '../http';

export interface City {
  id: string;
  name: string;
  code: string;
  state: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityDTO {
  name: string;
  code: string;
  state: string;
  country?: string;
  isActive?: boolean;
}

export interface UpdateCityDTO {
  name?: string;
  code?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
}

export interface CityFilters {
  search?: string;
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

export const citiesApi = {
  list: (params?: CityFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<City>>>('/admin/cities', { params }),

  getAllActive: () =>
    apiClient.get<ApiResponse<City[]>>('/admin/cities/active'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<City>>(`/admin/cities/${id}`),

  create: (data: CreateCityDTO) =>
    apiClient.post<ApiResponse<City>>('/admin/cities', data),

  update: (id: string, data: UpdateCityDTO) =>
    apiClient.patch<ApiResponse<City>>(`/admin/cities/${id}`, data),

  archive: (id: string) =>
    apiClient.patch<ApiResponse<City>>(`/admin/cities/${id}/archive`),
};
