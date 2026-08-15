import { apiClient } from '@/lib/api/http';

export interface OrderEscalationSettings {
  orderEscalationEnabled: boolean;
  orderAcceptanceTimeoutSeconds: number;
  orderEscalationRepeatIntervalSeconds: number;
  orderEscalationMaxAttempts: number;
  orderEscalationMaxDurationSeconds: number;
  emailOnFirstEscalation: boolean;
  callOnFirstEscalation: boolean;
  callOnRepeatedEscalation: boolean;
}

export const orderEscalationApi = {
  async getSettings() {
    return apiClient.get<{ success: true; data: OrderEscalationSettings }>(
      '/admin/order-escalation/settings',
    );
  },

  async updateSettings(data: Partial<OrderEscalationSettings>) {
    return apiClient.patch<{ success: true; data: OrderEscalationSettings }>(
      '/admin/order-escalation/settings',
      data,
    );
  },

  async acceptOrder(orderId: string) {
    return apiClient.patch(`/branch/orders/${orderId}/accept`);
  },

  async rejectOrder(orderId: string, reason: string) {
    return apiClient.patch(`/branch/orders/${orderId}/reject`, { reason });
  },

  async acknowledgeEscalation(orderId: string) {
    return apiClient.post(`/branch/orders/${orderId}/acknowledge-escalation`);
  },

  async getEscalationHistory(orderId: string) {
    return apiClient.get(`/branch/orders/${orderId}/escalation-history`);
  },
};
