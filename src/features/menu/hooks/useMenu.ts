import { create } from 'zustand';
import { FoodItem, FoodItemFormData, MenuFilters, Availability, HealthTag, Category, DEFAULT_CATEGORIES } from '../types/menu';
import { mockFoods } from '../mock/foods';

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

  addCategory: (data: Omit<Category, 'id' | 'createdAt' | 'sortOrder'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (fromIndex: number, toIndex: number) => void;

  addFood: (data: FoodItemFormData) => void;
  updateFood: (id: string, data: FoodItemFormData) => void;
  deleteFood: (id: string) => void;
  duplicateFood: (food: FoodItem) => void;
  archiveFood: (id: string) => void;
  toggleFeatured: (id: string) => void;
  toggleAvailability: (id: string) => void;

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
  foods: mockFoods,
  categories: DEFAULT_CATEGORIES,
  filters: { ...initialFilters },
  selectedFood: null,
  drawerOpen: false,
  drawerMode: 'add',
  deleteModalOpen: false,
  foodToDelete: null,
  categoryModalOpen: false,
  loading: false,

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

  addCategory: (data) => set((state) => {
    const id = `cat-${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCategory: Category = {
      ...data,
      id,
      slug,
      sortOrder: state.categories.length,
      createdAt: Date.now(),
    };
    return { categories: [...state.categories, newCategory] };
  }),

  updateCategory: (id, data) => set((state) => ({
    categories: state.categories.map((c) =>
      c.id === id ? { ...c, ...data, slug: data.name ? data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : c.slug } : c
    ),
  })),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id),
  })),

  reorderCategories: (fromIndex, toIndex) => set((state) => {
    const cats = [...state.categories];
    const [moved] = cats.splice(fromIndex, 1);
    cats.splice(toIndex, 0, moved);
    return { categories: cats.map((c, i) => ({ ...c, sortOrder: i })) };
  }),

  addFood: (data) => set((state) => {
    const id = `food-${Date.now()}`;
    const now = Date.now();
    const newFood: FoodItem = {
      id,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      shortDescription: data.shortDescription,
      category: data.category,
      price: data.price,
      preparationTime: data.preparationTime,
      nutrition: {
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        servingSize: data.servingSize,
      },
      healthTags: data.healthTags,
      customerLabels: data.customerLabels,
      availability: data.availability,
      isVegetarian: data.isVegetarian,
      isFeatured: data.isFeatured,
      displayOnWebsite: data.displayOnWebsite,
      bestPairedWith: data.bestPairedWith,
      imageUrl: '/foods/placeholder.jpg',
      galleryImages: [],
      createdAt: now,
      updatedAt: now,
    };
    return { foods: [newFood, ...state.foods], drawerOpen: false, selectedFood: null };
  }),

  updateFood: (id, data) => set((state) => ({
    foods: state.foods.map((f) =>
      f.id === id
        ? {
            ...f,
            ...data,
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
            nutrition: {
              calories: data.calories,
              protein: data.protein,
              carbs: data.carbs,
              fats: data.fats,
              servingSize: data.servingSize,
            },
            updatedAt: Date.now(),
          }
        : f
    ),
    drawerOpen: false,
    selectedFood: null,
  })),

  deleteFood: (id) => set((state) => ({
    foods: state.foods.filter((f) => f.id !== id),
    deleteModalOpen: false,
    foodToDelete: null,
  })),

  duplicateFood: (food) => set((state) => {
    const now = Date.now();
    const duplicate: FoodItem = {
      ...food,
      id: `food-${now}`,
      name: `${food.name} (Copy)`,
      slug: `${food.slug}-copy`,
      createdAt: now,
      updatedAt: now,
    };
    return { foods: [duplicate, ...state.foods] };
  }),

  archiveFood: (id) => set((state) => ({
    foods: state.foods.map((f) =>
      f.id === id ? { ...f, availability: 'unavailable' as const, displayOnWebsite: false, updatedAt: Date.now() } : f
    ),
  })),

  toggleFeatured: (id) => set((state) => ({
    foods: state.foods.map((f) =>
      f.id === id ? { ...f, isFeatured: !f.isFeatured, updatedAt: Date.now() } : f
    ),
  })),

  toggleAvailability: (id) => set((state) => ({
    foods: state.foods.map((f) => {
      if (f.id !== id) return f;
      const next = f.availability === 'available' ? 'unavailable' : 'available';
      return { ...f, availability: next, updatedAt: Date.now() };
    }),
  })),

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
    const { foods } = get();
    const uniqueCategories = new Set(foods.map((f) => f.category));
    const available = foods.filter((f) => f.availability === 'available');
    const avgPrice = foods.length > 0 ? Math.round(foods.reduce((s, f) => s + f.price, 0) / foods.length) : 0;

    return {
      total: foods.length,
      available: available.length,
      outOfStock: foods.filter((f) => f.availability === 'out-of-stock').length,
      categories: uniqueCategories.size,
      avgPrice,
    };
  },
}));
