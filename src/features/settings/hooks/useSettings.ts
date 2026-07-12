import { create } from 'zustand';
import { settingsApi, type BusinessSettingsData } from '@/lib/api/settings.api';
import type { SettingsTab } from '../types/settings';

interface SettingsStore {
  settings: BusinessSettingsData | null;
  loading: boolean;
  saving: boolean;
  activeTab: SettingsTab;
  error: string | null;
  successMessage: string | null;

  loadSettings: () => Promise<void>;
  setActiveTab: (tab: SettingsTab) => void;
  updateBusiness: (data: Record<string, unknown>) => Promise<void>;
  updateTax: (data: Record<string, unknown>) => Promise<void>;
  updatePayment: (data: Record<string, unknown>) => Promise<void>;
  updateDelivery: (data: Record<string, unknown>) => Promise<void>;
  addPincode: (data: Record<string, unknown>) => Promise<void>;
  updatePincode: (id: string, data: Record<string, unknown>) => Promise<void>;
  deletePincode: (id: string) => Promise<void>;
  clearMessages: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  saving: false,
  activeTab: 'business',
  error: null,
  successMessage: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await settingsApi.getSettings();
      set({ settings: res.data.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      set({ error: message, loading: false });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateBusiness: async (data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      const res = await settingsApi.updateBusiness(data);
      set({
        settings: res.data.data,
        saving: false,
        successMessage: 'Business settings updated',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update business settings';
      set({ error: message, saving: false });
    }
  },

  updateTax: async (data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await settingsApi.updateTax(data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Tax settings updated' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update tax settings';
      set({ error: message, saving: false });
    }
  },

  updatePayment: async (data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await settingsApi.updatePayment(data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Payment settings updated' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update payment settings';
      set({ error: message, saving: false });
    }
  },

  updateDelivery: async (data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await settingsApi.updateDelivery(data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Delivery settings updated' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update delivery settings';
      set({ error: message, saving: false });
    }
  },

  addPincode: async (data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await settingsApi.addPincode(data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Pincode added' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add pincode';
      set({ error: message, saving: false });
    }
  },

  updatePincode: async (id, data) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await settingsApi.updatePincode(id, data);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Pincode updated' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update pincode';
      set({ error: message, saving: false });
    }
  },

  deletePincode: async (id) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await settingsApi.deletePincode(id);
      await get().loadSettings();
      set({ saving: false, successMessage: 'Pincode removed' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete pincode';
      set({ error: message, saving: false });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
