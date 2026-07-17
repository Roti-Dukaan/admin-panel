import { apiClient } from './http';

export interface DeliveryProviderSettingsData {
  id: string;
  businessSettingsId: string;
  primaryProvider: string | null;
  fallbackProvider: string | null;
  activeStrategy: string;
  autoFallback: boolean;
  retryCount: number;
  retryDelay: number;
  providerTimeout: number;
  healthCheckInterval: number;
  sandboxMode: boolean;
  enableLogging: boolean;
  enableHealthChecks: boolean;
  providers: ProviderConfigData[];
  health: ProviderHealthData[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfigData {
  id: string;
  provider: string;
  enabled: boolean;
  priority: number;
  environment: string;
  status: string;
  lastSyncAt: string | null;
  lastHealthCheckAt: string | null;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasWebhookSecret: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderHealthData {
  id: string;
  provider: string;
  isHealthy: boolean;
  averageResponseTime: number | null;
  failedRequests: number;
  successfulRequests: number;
  successRate: number;
  lastError: string | null;
  lastWebhookAt: string | null;
  lastHealthCheckAt: string | null;
  checkedAt: string;
}

export interface DeliveryEventLogData {
  id: string;
  orderId: string | null;
  deliveryId: string | null;
  provider: string | null;
  strategy: string | null;
  event: string;
  executionTimeMs: number | null;
  retryCount: number;
  fallbackTriggered: boolean;
  failureReason: string | null;
  correlationId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const deliveryProviderApi = {
  getSettings: () =>
    apiClient.get<ApiResponse<DeliveryProviderSettingsData>>('/admin/delivery/settings'),

  updateSettings: (data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<DeliveryProviderSettingsData>>('/admin/delivery/settings', data),

  getProviders: () =>
    apiClient.get<ApiResponse<ProviderConfigData[]>>('/admin/delivery/providers'),

  getProvider: (id: string) =>
    apiClient.get<ApiResponse<ProviderConfigData>>(`/admin/delivery/providers/${id}`),

  updateProvider: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<ProviderConfigData>>(`/admin/delivery/providers/${id}`, data),

  testConnection: (provider: string) =>
    apiClient.post<ApiResponse<{ provider: string; isHealthy: boolean; responseTimeMs: number; error?: string }>>(
      '/admin/delivery/providers/test',
      { provider },
    ),

  runHealthChecks: () =>
    apiClient.post<ApiResponse<Array<{ provider: string; isHealthy: boolean; responseTimeMs: number; error?: string }>>>(
      '/admin/delivery/providers/health-check',
    ),

  getHealthStatuses: () =>
    apiClient.get<ApiResponse<ProviderHealthData[]>>('/admin/delivery/health'),

  getEventLogs: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<PaginatedResponse<DeliveryEventLogData>>>('/admin/delivery/events', { params }),

  getWebhookLogs: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<PaginatedResponse<DeliveryEventLogData>>>('/admin/delivery/logs', { params }),
};
