import { apiClient } from '@/lib/api/http';

export interface RealtimeOrderHoursSettings {
  realtimeOrderScheduleEnabled: boolean;
  realtimeOrderOpenTime: string;
  realtimeOrderCloseTime: string;
  currentlyAcceptingOrders: boolean;
}

export interface PreviewReopenResult {
  requestedReopenAt: string;
  effectiveReopenAt: string;
  adjustedForGlobalHours: boolean;
}

export const realtimeOrderHoursApi = {
  getSettings: () =>
    apiClient.get<{ success: true; data: RealtimeOrderHoursSettings }>(
      '/admin/settings/realtime-order-hours',
    ),

  updateSettings: (data: Partial<RealtimeOrderHoursSettings>) =>
    apiClient.patch<{ success: true; data: RealtimeOrderHoursSettings }>(
      '/admin/settings/realtime-order-hours',
      data,
    ),

  previewReopen: (scheduledReopenAt: string) =>
    apiClient.post<{ success: true; data: PreviewReopenResult }>(
      '/admin/kitchen/status/preview-reopen',
      { scheduledReopenAt },
    ),
};
