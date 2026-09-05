import { create } from 'zustand';
import { appHomePageApi } from '@/lib/api/app-home-page.api';
import { extractApiError } from '@/lib/api/extract-api-error';
import type {
  AppHomePageSection,
  AppHomePageSectionForm,
  AppHomePageSectionType,
} from '@/features/app-home-page/types/app-home-page';

interface AppHomePageStore {
  sections: AppHomePageSection[];
  previewSections: AppHomePageSection[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  successMessage: string | null;
  previewLocation: string;
  editingSection: AppHomePageSection | null;
  addSectionType: AppHomePageSectionType | null;
  loadSections: () => Promise<void>;
  loadPreview: (location?: string) => Promise<void>;
  setPreviewLocation: (location: string) => void;
  setEditingSection: (section: AppHomePageSection | null) => void;
  setAddSectionType: (type: AppHomePageSectionType | null) => void;
  createSection: (payload: AppHomePageSectionForm, bannerImage?: File | null) => Promise<boolean>;
  updateSection: (id: string, payload: Partial<AppHomePageSectionForm>, bannerImage?: File | null) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
  reorderSections: (items: { id: string; order: number }[]) => Promise<void>;
  clearMessages: () => void;
}

export const useAppHomePageStore = create<AppHomePageStore>((set, get) => ({
  sections: [],
  previewSections: [],
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  successMessage: null,
  previewLocation: 'Hyderabad',
  editingSection: null,
  addSectionType: null,

  loadSections: async () => {
    set({ loading: true, error: null });
    try {
      const res = await appHomePageApi.list();
      const sections = res.data?.sections ?? [];
      set({ sections, loading: false });
      await get().loadPreview(get().previewLocation);
    } catch (e: unknown) {
      set({ loading: false, error: extractApiError(e, 'Failed to load sections') });
    }
  },

  loadPreview: async (location) => {
    const loc = location ?? get().previewLocation;
    try {
      const res = await appHomePageApi.preview(loc);
      set({ previewSections: res.data?.sections ?? [], previewLocation: loc });
    } catch {
      set({ previewSections: get().sections.filter((s) => s.isActive) });
    }
  },

  setPreviewLocation: (location) => {
    set({ previewLocation: location });
    void get().loadPreview(location);
  },

  setEditingSection: (section) => set({ editingSection: section }),
  setAddSectionType: (type) => set({ addSectionType: type }),

  createSection: async (payload, bannerImage) => {
    set({ saving: true, error: null });
    try {
      await appHomePageApi.create(payload, bannerImage);
      set({ saving: false, successMessage: 'Section created', addSectionType: null });
      await get().loadSections();
      return true;
    } catch (e: unknown) {
      set({ saving: false, error: extractApiError(e, 'Failed to create section') });
      return false;
    }
  },

  updateSection: async (id, payload, bannerImage) => {
    set({ saving: true, error: null });
    try {
      await appHomePageApi.update(id, payload, bannerImage);
      set({ saving: false, successMessage: 'Section updated', editingSection: null });
      await get().loadSections();
      return true;
    } catch (e: unknown) {
      set({ saving: false, error: extractApiError(e, 'Failed to update section') });
      return false;
    }
  },

  deleteSection: async (id) => {
    set({ deleting: true, error: null });
    try {
      await appHomePageApi.delete(id);
      set({ deleting: false, successMessage: 'Section deleted' });
      await get().loadSections();
      return true;
    } catch (e: unknown) {
      set({ deleting: false, error: extractApiError(e, 'Failed to delete section') });
      return false;
    }
  },

  reorderSections: async (items) => {
    const previous = get().sections;
    const sorted = [...previous].sort((a, b) => {
      const ao = items.find((i) => i.id === a.id)?.order ?? a.sectionOrder;
      const bo = items.find((i) => i.id === b.id)?.order ?? b.sectionOrder;
      return ao - bo;
    });
    set({ sections: sorted.map((s, index) => ({ ...s, sectionOrder: index, order: index })) });
    try {
      await appHomePageApi.reorder(items);
      set({ successMessage: 'Section order saved' });
      await get().loadPreview(get().previewLocation);
    } catch (e: unknown) {
      set({ sections: previous, error: extractApiError(e, 'Failed to reorder sections') });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
