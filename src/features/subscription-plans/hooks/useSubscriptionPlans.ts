import { create } from 'zustand';
import {
  SubscriptionPlan,
  PlanStatus,
  PlanTab,
  PlanBenefit,
  PlanPricing,
  MealConfiguration,
  DeliverySchedule,
  MenuInclusion,
  PlanRules,
  DeliveryRules,
  SeoConfig,
} from '../types/subscription-plan';
import { mockSubscriptionPlans } from '../mock/subscription-plans';

interface SubscriptionPlanStore {
  plans: SubscriptionPlan[];
  loading: boolean;
  searchQuery: string;
  statusFilter: PlanStatus | 'all';
  editorOpen: boolean;
  editorMode: 'create' | 'edit' | 'view';
  activeTab: PlanTab;
  selectedPlan: SubscriptionPlan | null;
  deleteModalOpen: boolean;
  planToDelete: SubscriptionPlan | null;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: PlanStatus | 'all') => void;

  openCreateEditor: () => void;
  openEditEditor: (plan: SubscriptionPlan) => void;
  openViewEditor: (plan: SubscriptionPlan) => void;
  closeEditor: () => void;
  setActiveTab: (tab: PlanTab) => void;

  openDeleteModal: (plan: SubscriptionPlan) => void;
  closeDeleteModal: () => void;

  addPlan: (plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt' | 'subscribers'>) => void;
  updatePlan: (id: string, data: Partial<SubscriptionPlan>) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (plan: SubscriptionPlan) => void;
  archivePlan: (id: string) => void;
  toggleFeatured: (id: string) => void;
  toggleStatus: (id: string, status: PlanStatus) => void;

  updatePlanPricing: (id: string, pricing: Partial<PlanPricing>) => void;
  updatePlanMeals: (id: string, meals: Partial<MealConfiguration>) => void;
  updatePlanDelivery: (id: string, delivery: Partial<DeliverySchedule>) => void;
  updatePlanMenu: (id: string, menu: Partial<MenuInclusion>) => void;
  updatePlanBenefits: (id: string, benefits: PlanBenefit[]) => void;
  updatePlanRules: (id: string, rules: Partial<PlanRules>) => void;
  updatePlanDeliveryRules: (id: string, deliveryRules: Partial<DeliveryRules>) => void;
  updatePlanSeo: (id: string, seo: Partial<SeoConfig>) => void;

  getFilteredPlans: () => SubscriptionPlan[];
  getStats: () => {
    total: number;
    active: number;
    draft: number;
    featured: number;
    weekly: number;
    monthly: number;
  };
}

export const useSubscriptionPlanStore = create<SubscriptionPlanStore>((set, get) => ({
  plans: mockSubscriptionPlans,
  loading: false,
  searchQuery: '',
  statusFilter: 'all',
  editorOpen: false,
  editorMode: 'create',
  activeTab: 'general',
  selectedPlan: null,
  deleteModalOpen: false,
  planToDelete: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  openCreateEditor: () =>
    set({
      editorOpen: true,
      editorMode: 'create',
      selectedPlan: null,
      activeTab: 'general',
    }),

  openEditEditor: (plan) =>
    set({
      editorOpen: true,
      editorMode: 'edit',
      selectedPlan: plan,
      activeTab: 'general',
    }),

  openViewEditor: (plan) =>
    set({
      editorOpen: true,
      editorMode: 'view',
      selectedPlan: plan,
      activeTab: 'general',
    }),

  closeEditor: () =>
    set({
      editorOpen: false,
      selectedPlan: null,
      activeTab: 'general',
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  openDeleteModal: (plan) => set({ deleteModalOpen: true, planToDelete: plan }),
  closeDeleteModal: () => set({ deleteModalOpen: false, planToDelete: null }),

  addPlan: (planData) => {
    const now = Date.now();
    const newPlan: SubscriptionPlan = {
      ...planData,
      id: `plan-${now}`,
      subscribers: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      plans: [newPlan, ...state.plans],
      editorOpen: false,
      selectedPlan: null,
    }));
  },

  updatePlan: (id, data) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
      ),
      editorOpen: false,
      selectedPlan: null,
    })),

  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      deleteModalOpen: false,
      planToDelete: null,
    })),

  duplicatePlan: (plan) => {
    const now = Date.now();
    const duplicate: SubscriptionPlan = {
      ...plan,
      id: `plan-${now}`,
      name: `${plan.name} (Copy)`,
      slug: `${plan.slug}-copy`,
      status: 'draft',
      subscribers: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      plans: [duplicate, ...state.plans],
    }));
  },

  archivePlan: (id) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, status: 'archived' as const, updatedAt: Date.now() } : p
      ),
    })),

  toggleFeatured: (id) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, isFeatured: !p.isFeatured, updatedAt: Date.now() } : p
      ),
    })),

  toggleStatus: (id, status) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, status, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanPricing: (id, pricing) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, pricing: { ...p.pricing, ...pricing }, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanMeals: (id, meals) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, meals: { ...p.meals, ...meals }, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanDelivery: (id, delivery) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, delivery: { ...p.delivery, ...delivery }, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanMenu: (id, menu) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, menu: { ...p.menu, ...menu }, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanBenefits: (id, benefits) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, benefits, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanRules: (id, rules) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, rules: { ...p.rules, ...rules }, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanDeliveryRules: (id, deliveryRules) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, deliveryRules: { ...p.deliveryRules, ...deliveryRules }, updatedAt: Date.now() } : p
      ),
    })),

  updatePlanSeo: (id, seo) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, seo: { ...p.seo, ...seo }, updatedAt: Date.now() } : p
      ),
    })),

  getFilteredPlans: () => {
    const { plans, searchQuery, statusFilter } = get();
    let filtered = [...plans];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.planBadge.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getStats: () => {
    const { plans } = get();
    return {
      total: plans.length,
      active: plans.filter((p) => p.status === 'published').length,
      draft: plans.filter((p) => p.status === 'draft').length,
      featured: plans.filter((p) => p.isFeatured).length,
      weekly: plans.filter((p) => p.delivery.deliveryDays.length >= 5).length,
      monthly: plans.filter((p) => p.pricing.monthlyPrice > 0).length,
    };
  },
}));
