import { apiClient } from './http';
import type { ApiResponse, PaginatedData, ApiProduct, ProductQueryParams } from '../types/api';

export const productApi = {
  async list(params?: ProductQueryParams): Promise<ApiResponse<PaginatedData<ApiProduct>>> {
    const { data } = await apiClient.get('/admin/products', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<ApiProduct>> {
    const { data } = await apiClient.get(`/admin/products/${id}`);
    return data;
  },

  async create(dto: Record<string, unknown>): Promise<ApiResponse<{ message: string; data: ApiProduct }>> {
    const { data } = await apiClient.post('/admin/products', dto);
    return data;
  },

  async update(id: string, dto: Record<string, unknown>): Promise<ApiResponse<{ message: string; data: ApiProduct }>> {
    const { data } = await apiClient.patch(`/admin/products/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/admin/products/${id}`);
    return data;
  },

  async restore(id: string): Promise<ApiResponse<{ message: string; data: ApiProduct }>> {
    const { data } = await apiClient.post(`/admin/products/${id}/restore`);
    return data;
  },

  async updateAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<{ message: string; data: ApiProduct }>> {
    const { data } = await apiClient.patch(`/admin/products/${id}/availability`, { isAvailable });
    return data;
  },

  async updateFeatured(id: string, isFeatured: boolean): Promise<ApiResponse<{ message: string; data: ApiProduct }>> {
    const { data } = await apiClient.patch(`/admin/products/${id}/featured`, { isFeatured });
    return data;
  },

  async duplicate(id: string): Promise<ApiResponse<{ message: string; data: ApiProduct }>> {
    const { data } = await apiClient.post(`/admin/products/${id}/duplicate`);
    return data;
  },

  async uploadImage(id: string, file: File): Promise<ApiResponse<{ message: string; data: { imageUrl: string } }>> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post(`/admin/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteImage(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/admin/products/${id}/image`);
    return data;
  },

  async addGalleryImage(id: string, file: File): Promise<ApiResponse<{ message: string; data: { gallery: string[] } }>> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post(`/admin/products/${id}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async removeGalleryImage(id: string, index: number): Promise<ApiResponse<{ message: string; data: { gallery: string[] } }>> {
    const { data } = await apiClient.delete(`/admin/products/${id}/gallery/${index}`);
    return data;
  },
};
