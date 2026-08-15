import { apiClient } from '@/lib/api/http';
import type { ApiResponse } from '@/lib/types/api';
import type {
  CreateNotificationInput,
  NotificationAnalytics,
  NotificationListResponse,
  PushNotification,
} from '../types/notification';

export const notificationsApi = {
  list: async (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    const { data } = await apiClient.get<ApiResponse<NotificationListResponse>>(
      `/admin/notifications?${params}`,
    );
    return data.data;
  },

  create: async (body: CreateNotificationInput) => {
    const { data } = await apiClient.post<ApiResponse<PushNotification>>(
      '/admin/notifications',
      body,
    );
    return data.data;
  },

  update: async (id: string, body: Partial<CreateNotificationInput>) => {
    const { data } = await apiClient.patch<ApiResponse<PushNotification>>(
      `/admin/notifications/${id}`,
      body,
    );
    return data.data;
  },

  send: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<PushNotification>>(
      `/admin/notifications/${id}/send`,
    );
    return data.data;
  },

  cancel: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean }>>(
      `/admin/notifications/${id}/cancel`,
    );
    return data.data;
  },

  analytics: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<NotificationAnalytics>>(
      `/admin/notifications/${id}/analytics`,
    );
    return data.data;
  },
};
