import { apiClient } from './http';
import type { ApiResponse, PaginatedData, ApiFoodItem, FoodItemQueryParams } from '../types/api';

export type FoodItemPayload = Record<string, unknown> | FormData;

export const foodItemApi = {
  async list(params?: FoodItemQueryParams): Promise<ApiResponse<PaginatedData<ApiFoodItem>>> {
    const { data } = await apiClient.get('/food-items', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<ApiFoodItem>> {
    const { data } = await apiClient.get(`/food-items/${id}`);
    return data;
  },

  async create(dto: FoodItemPayload): Promise<ApiResponse<{ message: string; data: ApiFoodItem }>> {
    const { data } = await apiClient.post('/food-items', dto);
    return data;
  },

  async update(id: string, dto: FoodItemPayload): Promise<ApiResponse<{ message: string; data: ApiFoodItem }>> {
    const { data } = await apiClient.patch(`/food-items/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/food-items/${id}`);
    return data;
  },

  async restore(id: string): Promise<ApiResponse<{ message: string; data: ApiFoodItem }>> {
    const { data } = await apiClient.post(`/food-items/${id}/restore`);
    return data;
  },

  async updateAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<{ message: string; data: ApiFoodItem }>> {
    const { data } = await apiClient.patch(`/food-items/${id}/availability`, { isAvailable });
    return data;
  },

  async updateFeatured(id: string, isFeatured: boolean): Promise<ApiResponse<{ message: string; data: ApiFoodItem }>> {
    const { data } = await apiClient.patch(`/food-items/${id}/featured`, { isFeatured });
    return data;
  },

  async duplicate(id: string): Promise<ApiResponse<{ message: string; data: ApiFoodItem }>> {
    const { data } = await apiClient.post(`/food-items/${id}/duplicate`);
    return data;
  },

  async uploadImage(id: string, file: File): Promise<ApiResponse<{ message: string; data: { imageUrl: string } }>> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post(`/food-items/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteImage(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/food-items/${id}/image`);
    return data;
  },

  async addGalleryImage(id: string, file: File): Promise<ApiResponse<{ message: string; data: { gallery: string[] } }>> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post(`/food-items/${id}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async removeGalleryImage(id: string, index: number): Promise<ApiResponse<{ message: string; data: { gallery: string[] } }>> {
    const { data } = await apiClient.delete(`/food-items/${id}/gallery/${index}`);
    return data;
  },
};
