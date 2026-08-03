import { create } from 'zustand';
import { FoodItem, FoodItemFormData, MenuFilters, Availability, HealthTag, Category } from '../types/menu';
import { categoryApi } from '@/lib/api/category.api';
import { foodItemApi } from '@/lib/api/food.api';
import type { ApiCategory, ApiFoodItem } from '@/lib/types/api';
import { API_BASE_URL } from '@/lib/env';

// Backend returns image paths relative to the API server; resolve them to absolute URLs
// so they load correctly from the admin (and any) frontend origin.
function resolveImageUrl(url?: string | null): string {
  if (!url) return '/foods/placeholder.jpg';
  if (/^https?:\/\//.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapApiCategoryToCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    emoji: '🍽️',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    sortOrder: api.displayOrder,
    createdAt: new Date(api.createdAt).getTime(),
  };
}

function toFormData(dto: Record<string, unknown>, imageFile: File): FormData {
  const fd = new FormData();
  Object.entries(dto).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  fd.append('image', imageFile);
  return fd;
}

function mapApiFoodItemToFoodItem(api: ApiFoodItem, categories: Category[]): FoodItem {
  const category = categories.find(c => c.id === api.categoryId);
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    description: api.description || '',
    shortDescription: api.shortDescription || '',
    category: category?.name || category?.slug || 'Uncategorized',
    price: Number(api.discountPrice || api.basePrice),
    preparationTime: api.preparationTime || 20,
    nutrition: {
      calories: api.calories || 0,
      protein: api.protein || 0,
      carbs: api.carbs || 0,
      fats: api.fats || 0,
      fiber: api.fiber || 0,
      servingSize: api.servingSize || '',
    },
    healthTags: [],
    customerLabels: api.isFeatured ? ['chef-special'] : [],
    availability: !api.isAvailable ? 'unavailable' : 'available',
    foodType: api.foodType ?? (api.isVeg ? 'VEG' : 'NON_VEG'),
    isFeatured: api.isFeatured,
    displayOnWebsite: api.isAvailable,
    bestPairedWith: [],
    imageUrl: resolveImageUrl(api.imageUrl),
    galleryImages: (api.gallery || []).map(resolveImageUrl),
    createdAt: new Date(api.createdAt).getTime(),
    updatedAt: new Date(api.updatedAt).getTime(),
  };
}

interface MenuStore {
  foods: FoodItem[];
  categories: Category[];
  filters: MenuFilters;
  selectedFood: FoodItem | null;
  drawerOpen: boolean;
  drawerMode: 'add' | 'edit' | 'view';
  deleteModalOpen: boolean;
  foodToDelete: FoodItem | null;
  categoryModalOpen: boolean;
  loading: boolean;
  dataLoaded: boolean;

  loadData: () => Promise<void>;
  setFoods: (foods: FoodItem[]) => void;
  setCategories: (categories: Category[]) => void;

  setSearch: (search: string) => void;
  toggleCategoryFilter: (category: string) => void;
  toggleAvailabilityFilter: (availability: Availability) => void;
  toggleHealthTagFilter: (tag: HealthTag) => void;
  clearFilters: () => void;

  openAddDrawer: () => void;
  openEditDrawer: (food: FoodItem) => void;
  openViewDrawer: (food: FoodItem) => void;
  closeDrawer: () => void;

  openDeleteModal: (food: FoodItem) => void;
  closeDeleteModal: () => void;

  openCategoryModal: () => void;
  closeCategoryModal: () => void;

  addCategory: (data: { name: string; slug: string; emoji: string; color: string; bgColor: string }) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addFood: (data: FoodItemFormData, imageFile?: File) => Promise<string>;
  updateFood: (id: string, data: FoodItemFormData, imageFile?: File) => Promise<void>;
  reloadFoods: () => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  duplicateFood: (food: FoodItem) => Promise<void>;
  archiveFood: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;

  getFilteredFoods: () => FoodItem[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
  getStats: () => { total: number; available: number; outOfStock: number; categories: number; avgPrice: number };
}

const initialFilters: MenuFilters = {
  search: '',
  category: [],
  availability: [],
  healthTags: [],
};

export const useMenuStore = create<MenuStore>((set, get) => ({
  foods: [],
  categories: [],
  filters: { ...initialFilters },
  selectedFood: null,
  drawerOpen: false,
  drawerMode: 'add',
  deleteModalOpen: false,
  foodToDelete: null,
  categoryModalOpen: false,
  loading: false,
  dataLoaded: false,

  loadData: async () => {
    if (get().dataLoaded) return;
    set({ loading: true });
    try {
      const [catRes, prodRes] = await Promise.allSettled([
        categoryApi.list({ limit: 100, sort: 'displayOrder', order: 'asc', status: 'active' }),
        foodItemApi.list({ limit: 200, sort: 'sort_order' }),
      ]);

      const categories = catRes.status === 'fulfilled'
        ? (catRes.value.data?.items || []).map(mapApiCategoryToCategory)
        : [];
      const foods = prodRes.status === 'fulfilled'
        ? (prodRes.value.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, categories))
        : [];

      set({ categories, foods, dataLoaded: true, loading: false });
    } catch (error) {
      console.error('Failed to load menu data:', error);
      set({ loading: false });
    }
  },

  setFoods: (foods) => set({ foods }),
  setCategories: (categories) => set({ categories }),

  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),

  toggleCategoryFilter: (category) => set((state) => {
    const exists = state.filters.category.includes(category);
    return {
      filters: {
        ...state.filters,
        category: exists ? state.filters.category.filter((c) => c !== category) : [...state.filters.category, category],
      },
    };
  }),

  toggleAvailabilityFilter: (availability) => set((state) => {
    const exists = state.filters.availability.includes(availability);
    return {
      filters: {
        ...state.filters,
        availability: exists ? state.filters.availability.filter((a) => a !== availability) : [...state.filters.availability, availability],
      },
    };
  }),

  toggleHealthTagFilter: (tag) => set((state) => {
    const exists = state.filters.healthTags.includes(tag);
    return {
      filters: {
        ...state.filters,
        healthTags: exists ? state.filters.healthTags.filter((t) => t !== tag) : [...state.filters.healthTags, tag],
      },
    };
  }),

  clearFilters: () => set({ filters: { ...initialFilters } }),

  openAddDrawer: () => set({ drawerOpen: true, drawerMode: 'add', selectedFood: null }),
  openEditDrawer: (food) => set({ drawerOpen: true, drawerMode: 'edit', selectedFood: food }),
  openViewDrawer: (food) => set({ drawerOpen: true, drawerMode: 'view', selectedFood: food }),
  closeDrawer: () => set({ drawerOpen: false, selectedFood: null }),

  openDeleteModal: (food) => set({ deleteModalOpen: true, foodToDelete: food }),
  closeDeleteModal: () => set({ deleteModalOpen: false, foodToDelete: null }),

  openCategoryModal: () => set({ categoryModalOpen: true }),
  closeCategoryModal: () => set({ categoryModalOpen: false }),

  addCategory: async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      await categoryApi.create(formData);
      // Reload categories
      const catRes = await categoryApi.list({ limit: 100, sort: 'displayOrder', order: 'asc' });
      const categories = (catRes.data?.items || []).map(mapApiCategoryToCategory);
      set({ categories });
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      await categoryApi.update(id, formData);
      const catRes = await categoryApi.list({ limit: 100, sort: 'displayOrder', order: 'asc' });
      const categories = (catRes.data?.items || []).map(mapApiCategoryToCategory);
      set({ categories });
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryApi.remove(id);
      const catRes = await categoryApi.list({ limit: 100, sort: 'displayOrder', order: 'asc' });
      const categories = (catRes.data?.items || []).map(mapApiCategoryToCategory);
      set({ categories });
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  },

  addFood: async (data, imageFile) => {
    try {
      const dto: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: get().categories.find(c => c.name === data.category || c.slug === data.category)?.id || '',
        basePrice: data.price,
        preparationTime: data.preparationTime,
        foodType: data.foodType,
        isVeg: data.foodType === 'VEG',
        isFeatured: data.isFeatured,
        isAvailable: data.availability === 'available',
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        fiber: data.fiber,
        servingSize: data.servingSize,
      };
      const payload: Record<string, unknown> | FormData = imageFile
        ? toFormData(dto, imageFile)
        : dto;
      const productRes = await foodItemApi.create(payload);
      const createdId = productRes.data?.data?.id || '';
      // Reload data
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods, drawerOpen: false, selectedFood: null });
      return createdId;
    } catch (error) {
      console.error('Failed to create food:', error);
      throw error;
    }
  },

  updateFood: async (id, data, imageFile) => {
    try {
      const dto: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: get().categories.find(c => c.name === data.category || c.slug === data.category)?.id,
        basePrice: data.price,
        preparationTime: data.preparationTime,
        foodType: data.foodType,
        isVeg: data.foodType === 'VEG',
        isFeatured: data.isFeatured,
        isAvailable: data.availability === 'available',
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        fiber: data.fiber,
        servingSize: data.servingSize,
      };
      const payload: Record<string, unknown> | FormData = imageFile
        ? toFormData(dto, imageFile)
        : dto;
      await foodItemApi.update(id, payload);
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods, drawerOpen: false, selectedFood: null });
    } catch (error) {
      console.error('Failed to update food:', error);
      throw error;
    }
  },

  reloadFoods: async () => {
    try {
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods });
    } catch (error) {
      console.error('Failed to reload foods:', error);
    }
  },

  deleteFood: async (id) => {
    try {
      await foodItemApi.remove(id);
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods, deleteModalOpen: false, foodToDelete: null });
    } catch (error) {
      console.error('Failed to delete food:', error);
      throw error;
    }
  },

  duplicateFood: async (food) => {
    try {
      await foodItemApi.duplicate(food.id);
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods });
    } catch (error) {
      console.error('Failed to duplicate food:', error);
      throw error;
    }
  },

  archiveFood: async (id) => {
    try {
      await foodItemApi.updateAvailability(id, false);
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods });
    } catch (error) {
      console.error('Failed to archive food:', error);
    }
  },

  toggleFeatured: async (id) => {
    const food = get().foods.find(f => f.id === id);
    if (!food) return;
    try {
      await foodItemApi.updateFeatured(id, !food.isFeatured);
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods });
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  },

  toggleAvailability: async (id) => {
    const food = get().foods.find(f => f.id === id);
    if (!food) return;
    try {
      await foodItemApi.updateAvailability(id, food.availability !== 'available');
      const prodRes = await foodItemApi.list({ limit: 200, sort: 'sort_order' });
      const foods = (prodRes.data?.items || []).map(p => mapApiFoodItemToFoodItem(p, get().categories));
      set({ foods });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  },

  getFilteredFoods: () => {
    const { foods, filters } = get();
    let filtered = [...foods];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }
    if (filters.category.length > 0) {
      filtered = filtered.filter((f) => filters.category.includes(f.category));
    }
    if (filters.availability.length > 0) {
      filtered = filtered.filter((f) => filters.availability.includes(f.availability));
    }
    if (filters.healthTags.length > 0) {
      filtered = filtered.filter((f) => filters.healthTags.some((t) => f.healthTags.includes(t)));
    }

    return filtered;
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },

  getCategoryByName: (name) => {
    return get().categories.find((c) => c.name === name || c.slug === name);
  },

  getStats: () => {
    const { foods, categories } = get();
    const available = foods.filter((f) => f.availability === 'available');
    const avgPrice = available.length > 0 ? Math.round(available.reduce((s, f) => s + f.price, 0) / available.length) : 0;

    return {
      total: foods.length,
      available: available.length,
      outOfStock: foods.filter((f) => f.availability === 'out-of-stock').length,
      categories: categories.length,
      avgPrice,
    };
  },
}));
