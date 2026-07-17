import { create } from 'zustand';
import {
  deliveryProviderApi,
  type DeliveryProviderSettingsData,
  type ProviderConfigData,
  type ProviderHealthData,
  type DeliveryEventLogData,
  type PaginatedResponse,
} from '@/lib/api/delivery-provider.api';

interface DeliveryProviderStore {
  settings: DeliveryProviderSettingsData | null;
  providers: ProviderConfigData[];
  health: ProviderHealthData[];
  eventLogs: PaginatedResponse<DeliveryEventLogData> | null;
  webhookLogs: PaginatedResponse<DeliveryEventLogData> | null;
  loading: boolean;
  saving: boolean;
  testing: boolean;
  error: string | null;
  successMessage: string | null;

  loadSettings: () => Promise<void>;
  loadProviders: () => Promise<void>;
  loadHealth: () => Promise<void>;
  loadEventLogs: (params?: Record<string, unknown>) => Promise<void>;
  loadWebhookLogs: (params?: Record<string, unknown>) => Promise<void>;
  updateSettings: (data: Record<string, unknown>) => Promise<void>;
  updateProvider: (id: string, data: Record<string, unknown>) => Promise<void>;
  testConnection: (provider: string) => Promise<{ isHealthy: boolean; responseTimeMs: number; error?: string }>;
  runHealthChecks: () => Promise<void>;
  clearMessages: () => void;
}

export const useDeliveryProviderStore = create<DeliveryProviderStore>((set, get) => ({
  settings: null,
  providers: [],
  health: [],
  eventLogs: null,
  webhookLogs: null,
  loading: false,
  saving: false,
  testing: false,
  error: null,
  successMessage: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await deliveryProviderApi.getSettings();
      const data = res.data.data;
      set({
        settings: data,
        providers: data.providers ?? [],
        health: data.health ?? [],
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load delivery provider settings';
      set({ error: message, loading: false });
    }
  },

  loadProviders: async () => {
    try {
      const res = await deliveryProviderApi.getProviders();
      set({ providers: res.data.data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load providers';
      set({ error: message });
    }
  },

  loadHealth: async () => {
    try {
      const res = await deliveryProviderApi.getHealthStatuses();
      set({ health: res.data.data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load health status';
      set({ error: message });
    }
  },

  loadEventLogs: async (params) => {
    try {
      const res = await deliveryProviderApi.getEventLogs(params);
      set({ eventLogs: res.data.data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load event logs';
      set({ error: message });
    }
  },

  loadWebhookLogs: async (params) => {
    try {
      const res = await deliveryProviderApi.getWebhookLogs(params);
      set({ webhookLogs: res.data.data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load webhook logs';
      set({ error: message });
    }
  },

  updateSettings: async (data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await deliveryProviderApi.updateSettings(data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Delivery provider settings updated' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update settings';
      set({ error: message, saving: false });
    }
  },

  updateProvider: async (id, data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await deliveryProviderApi.updateProvider(id, data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Provider configuration updated' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update provider';
      set({ error: message, saving: false });
    }
  },

  testConnection: async (provider) => {
    set({ testing: true, error: null });
    try {
      const res = await deliveryProviderApi.testConnection(provider);
      set({ testing: false });
      return res.data.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to test connection';
      set({ error: message, testing: false });
      return { isHealthy: false, responseTimeMs: 0, error: message };
    }
  },

  runHealthChecks: async () => {
    set({ testing: true, error: null });
    try {
      await deliveryProviderApi.runHealthChecks();
      await get().loadHealth();
      set({ testing: false, successMessage: 'Health checks completed' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to run health checks';
      set({ error: message, testing: false });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
