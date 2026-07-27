import { apiClient } from './http';
import type { ApiResponse, ApiHomepageBanner } from '../types/api';

export interface BannerFormData {
  title: string;
  subtitle?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  redirectType: 'NONE' | 'CATEGORY' | 'PRODUCT' | 'SUBSCRIPTION' | 'EXTERNAL_URL';
  redirectValue?: string;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface BannerImageFile {
  desktopImage?: File | null;
  mobileImage?: File | null;
}

export interface ReorderBannersPayload {
  banners: { id: string; displayOrder: number }[];
}

export const homepageBannerApi = {
  async list(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<{ banners: ApiHomepageBanner[]; total: number; page: number; limit: number }>> {
    const { data } = await apiClient.get('/admin/homepage/banners', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<ApiHomepageBanner>> {
    const { data } = await apiClient.get(`/admin/homepage/banners/${id}`);
    return data;
  },

  async create(
    formData: BannerFormData,
    desktopImage?: File | null,
    mobileImage?: File | null,
  ): Promise<ApiResponse<{ message: string; data: ApiHomepageBanner }>> {
    const payload = new FormData();
    payload.append('title', formData.title);
    if (formData.subtitle) payload.append('subtitle', formData.subtitle);
    if (formData.desktopImageUrl) payload.append('desktopImageUrl', formData.desktopImageUrl);
    if (formData.mobileImageUrl) payload.append('mobileImageUrl', formData.mobileImageUrl);
    payload.append('redirectType', formData.redirectType);
    if (formData.redirectValue) payload.append('redirectValue', formData.redirectValue);
    if (formData.displayOrder !== undefined) payload.append('displayOrder', String(formData.displayOrder));
    if (formData.startDate) payload.append('startDate', formData.startDate);
    if (formData.endDate) payload.append('endDate', formData.endDate);
    if (formData.isActive !== undefined) payload.append('isActive', String(formData.isActive));
    if (desktopImage) payload.append('desktopImage', desktopImage);
    if (mobileImage) payload.append('mobileImage', mobileImage);

    const { data } = await apiClient.post('/admin/homepage/banners', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(
    id: string,
    formData: BannerFormData,
    desktopImage?: File | null,
    mobileImage?: File | null,
  ): Promise<ApiResponse<{ message: string; data: ApiHomepageBanner }>> {
    const payload = new FormData();
    if (formData.title !== undefined) payload.append('title', formData.title);
    if (formData.subtitle !== undefined) payload.append('subtitle', formData.subtitle);
    if (formData.desktopImageUrl !== undefined) payload.append('desktopImageUrl', formData.desktopImageUrl);
    if (formData.mobileImageUrl !== undefined) payload.append('mobileImageUrl', formData.mobileImageUrl);
    if (formData.redirectType !== undefined) payload.append('redirectType', formData.redirectType);
    if (formData.redirectValue !== undefined) payload.append('redirectValue', formData.redirectValue);
    if (formData.displayOrder !== undefined) payload.append('displayOrder', String(formData.displayOrder));
    if (formData.startDate !== undefined) payload.append('startDate', formData.startDate);
    if (formData.endDate !== undefined) payload.append('endDate', formData.endDate);
    if (formData.isActive !== undefined) payload.append('isActive', String(formData.isActive));
    if (desktopImage) payload.append('desktopImage', desktopImage);
    if (mobileImage) payload.append('mobileImage', mobileImage);

    const { data } = await apiClient.patch(`/admin/homepage/banners/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/admin/homepage/banners/${id}`);
    return data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<{ message: string; data: ApiHomepageBanner }>> {
    const { data } = await apiClient.patch(`/admin/homepage/banners/${id}/status`, { isActive });
    return data;
  },

  async reorder(banners: { id: string; displayOrder: number }[]): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.patch('/admin/homepage/banners/reorder', { banners });
    return data;
  },
};