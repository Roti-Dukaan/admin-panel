import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    return api.get<{ success: true; data: OrderEscalationSettings }>(
      '/v1/admin/order-escalation/settings',
    );
  },

  async updateSettings(data: Partial<OrderEscalationSettings>) {
    return api.patch<{ success: true; data: OrderEscalationSettings }>(
      '/v1/admin/order-escalation/settings',
      data,
    );
  },

  async acceptOrder(orderId: string) {
    return api.patch(`/v1/branch/orders/${orderId}/accept`);
  },

  async rejectOrder(orderId: string, reason: string) {
    return api.patch(`/v1/branch/orders/${orderId}/reject`, { reason });
  },

  async acknowledgeEscalation(orderId: string) {
    return api.post(`/v1/branch/orders/${orderId}/acknowledge-escalation`);
  },

  async getEscalationHistory(orderId: string) {
    return api.get(`/v1/branch/orders/${orderId}/escalation-history`);
  },
};
