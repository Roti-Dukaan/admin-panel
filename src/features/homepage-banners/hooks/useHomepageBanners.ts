import { create } from 'zustand';
import { homepageBannerApi, type BannerFormData } from '@/lib/api/homepage-banner.api';
import type { ApiHomepageBanner } from '@/lib/types/api';

interface HomepageBannerState {
  banners: ApiHomepageBanner[];
  total: number;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  successMessage: string | null;
  activeTab: 'list' | 'create' | 'edit';
  editingBanner: ApiHomepageBanner | null;
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';

  loadBanners: (params?: { page?: number; limit?: number; isActive?: boolean; search?: string }) => Promise<void>;
  createBanner: (formData: BannerFormData, desktopImage?: File | null, mobileImage?: File | null) => Promise<void>;
  updateBanner: (id: string, formData: BannerFormData, desktopImage?: File | null, mobileImage?: File | null) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string, isActive: boolean) => Promise<void>;
  reorderBanners: (banners: { id: string; displayOrder: number }[]) => Promise<void>;
  setActiveTab: (tab: 'list' | 'create' | 'edit') => void;
  setEditingBanner: (banner: ApiHomepageBanner | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
  clearMessages: () => void;
}

export const useHomepageBannerStore = create<HomepageBannerState>((set, get) => ({
  banners: [],
  total: 0,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  successMessage: null,
  activeTab: 'list',
  editingBanner: null,
  searchQuery: '',
  statusFilter: 'all',

  loadBanners: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await homepageBannerApi.list(params);
      const payload = res?.data;
      set({
        banners: payload?.banners ?? [],
        total: payload?.total ?? 0,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load banners';
      set({ banners: [], total: 0, error: message, loading: false });
    }
  },

  createBanner: async (formData, desktopImage, mobileImage) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await homepageBannerApi.create(formData, desktopImage, mobileImage);
      await get().loadBanners();
      set({ saving: false, successMessage: 'Banner created successfully', activeTab: 'list' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create banner';
      set({ error: message, saving: false });
    }
  },

  updateBanner: async (id, formData, desktopImage, mobileImage) => {
    set({ saving: true, error: null, successMessage: null });
    try {
      await homepageBannerApi.update(id, formData, desktopImage, mobileImage);
      await get().loadBanners();
      set({ saving: false, successMessage: 'Banner updated successfully', activeTab: 'list', editingBanner: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update banner';
      set({ error: message, saving: false });
    }
  },

  deleteBanner: async (id) => {
    set({ deleting: true, error: null });
    try {
      await homepageBannerApi.delete(id);
      await get().loadBanners();
      set({ deleting: false, successMessage: 'Banner deleted successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete banner';
      set({ error: message, deleting: false });
    }
  },

  toggleBannerStatus: async (id, isActive) => {
    try {
      await homepageBannerApi.updateStatus(id, isActive);
      await get().loadBanners();
      set({ successMessage: `Banner ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update banner status';
      set({ error: message });
    }
  },

  reorderBanners: async (banners) => {
    try {
      await homepageBannerApi.reorder(banners);
      await get().loadBanners();
      set({ successMessage: 'Banner order updated successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reorder banners';
      set({ error: message });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setEditingBanner: (banner) => set({ editingBanner: banner }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));