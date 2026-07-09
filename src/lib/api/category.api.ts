import { apiClient } from './http';
import type { ApiResponse, PaginatedData, ApiCategory, CategoryQueryParams } from '../types/api';

export const categoryApi = {
  async list(params?: CategoryQueryParams): Promise<ApiResponse<PaginatedData<ApiCategory>>> {
    const { data } = await apiClient.get('/categories', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<ApiCategory>> {
    const { data } = await apiClient.get(`/categories/${id}`);
    return data;
  },

  async create(formData: FormData): Promise<ApiResponse<{ message: string; data: ApiCategory }>> {
    const { data } = await apiClient.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: string, formData: FormData): Promise<ApiResponse<{ message: string; data: ApiCategory }>> {
    const { data } = await apiClient.patch(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<{ message: string; data: ApiCategory }>> {
    const { data } = await apiClient.patch(`/categories/${id}/status`, { isActive });
    return data;
  },

  async reorder(categories: { id: string; displayOrder: number }[]): Promise<ApiResponse<ApiCategory[]>> {
    const { data } = await apiClient.patch('/categories/reorder', { categories });
    return data;
  },

  async remove(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },
};
