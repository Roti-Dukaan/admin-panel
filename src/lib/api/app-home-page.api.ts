import { apiClient } from './http';
import type { ApiResponse } from '../types/api';
import type {
  AppHomePageSection,
  AppHomePageSectionForm,
  BannerUploadFiles,
} from '@/features/app-home-page/types/app-home-page';

export interface ReorderSectionsPayload {
  sectionOrder: { id: string; order: number }[];
}

function appendFormFields(form: FormData, payload: AppHomePageSectionForm) {
  form.append('sectionType', payload.sectionType);
  if (payload.title !== undefined) form.append('title', payload.title);
  form.append('config', JSON.stringify(payload.config));
  form.append('isActive', String(payload.isActive));
  if (payload.startAt) form.append('startAt', payload.startAt);
  if (payload.endAt) form.append('endAt', payload.endAt);
  if (payload.targetLocations?.length) {
    form.append('targetLocations', JSON.stringify(payload.targetLocations));
  }
}

function appendBannerFiles(form: FormData, files?: BannerUploadFiles) {
  if (files?.bannerImage) {
    form.append('bannerImage', files.bannerImage);
  }
  if (files?.bannerSlideFiles) {
    for (const [index, file] of Object.entries(files.bannerSlideFiles)) {
      form.append(`bannerImage_${index}`, file);
    }
  }
}

function hasBannerFiles(files?: BannerUploadFiles): boolean {
  if (files?.bannerImage) return true;
  return !!files?.bannerSlideFiles && Object.keys(files.bannerSlideFiles).length > 0;
}

export const appHomePageApi = {
  async list(): Promise<ApiResponse<{ sections: AppHomePageSection[] }>> {
    const { data } = await apiClient.get('/admin/home-page/sections');
    return data;
  },

  async getById(id: string): Promise<ApiResponse<AppHomePageSection>> {
    const { data } = await apiClient.get(`/admin/home-page/sections/${id}`);
    return data;
  },

  async preview(location?: string): Promise<ApiResponse<{ sections: AppHomePageSection[] }>> {
    const { data } = await apiClient.get('/admin/home-page/preview', { params: { location } });
    return data;
  },

  async create(
    payload: AppHomePageSectionForm,
    files?: BannerUploadFiles,
  ): Promise<ApiResponse<AppHomePageSection>> {
    if (hasBannerFiles(files)) {
      const form = new FormData();
      appendFormFields(form, payload);
      appendBannerFiles(form, files);
      const { data } = await apiClient.post('/admin/home-page/sections', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await apiClient.post('/admin/home-page/sections', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<AppHomePageSectionForm>,
    files?: BannerUploadFiles,
  ): Promise<ApiResponse<AppHomePageSection>> {
    if (hasBannerFiles(files)) {
      const form = new FormData();
      if (payload.sectionType) form.append('sectionType', payload.sectionType);
      form.append('title', payload.title ?? '');
      if (payload.config) form.append('config', JSON.stringify(payload.config));
      if (payload.isActive !== undefined) form.append('isActive', String(payload.isActive));
      if (payload.startAt) form.append('startAt', payload.startAt);
      if (payload.endAt) form.append('endAt', payload.endAt);
      if (payload.targetLocations) form.append('targetLocations', JSON.stringify(payload.targetLocations));
      appendBannerFiles(form, files);
      const { data } = await apiClient.patch(`/admin/home-page/sections/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await apiClient.patch(`/admin/home-page/sections/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete(`/admin/home-page/sections/${id}`);
    return data;
  },

  async reorder(sectionOrder: { id: string; order: number }[]): Promise<ApiResponse<null>> {
    const { data } = await apiClient.patch('/admin/home-page/sections/reorder', { sectionOrder });
    return data;
  },
};
