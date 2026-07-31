import { create } from "zustand";
import {
  CreateSubscriptionPlanInput,
  PlanStatusFilter,
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from "../types/subscription-plan";
import { plansApi } from "../services/plans.api";

interface SubscriptionPlanStore {
  plans: SubscriptionPlan[];
  loading: boolean;
  searchQuery: string;
  statusFilter: PlanStatusFilter;
  editorOpen: boolean;
  editorMode: "create" | "edit" | "view";
  selectedPlan: SubscriptionPlan | null;
  deleteModalOpen: boolean;
  planToDelete: SubscriptionPlan | null;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: PlanStatusFilter) => void;

  loadPlans: () => Promise<void>;

  openCreateEditor: () => void;
  openEditEditor: (plan: SubscriptionPlan) => void;
  openViewEditor: (plan: SubscriptionPlan) => void;
  closeEditor: () => void;

  openDeleteModal: (plan: SubscriptionPlan) => void;
  closeDeleteModal: () => void;

  addPlan: (plan: CreateSubscriptionPlanInput) => Promise<SubscriptionPlan>;
  updatePlan: (id: string, data: UpdateSubscriptionPlanInput) => Promise<SubscriptionPlan>;
  deletePlan: (id: string) => Promise<void>;
  duplicatePlan: (plan: SubscriptionPlan) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;

  getFilteredPlans: () => SubscriptionPlan[];
  getStats: () => {
    total: number;
    active: number;
    inactive: number;
    weekly: number;
    monthly: number;
  };
}

export const useSubscriptionPlanStore = create<SubscriptionPlanStore>((set, get) => ({
  plans: [],
  loading: false,
  searchQuery: "",
  statusFilter: "all",
  editorOpen: false,
  editorMode: "create",
  selectedPlan: null,
  deleteModalOpen: false,
  planToDelete: null,

  loadPlans: async () => {
    set({ loading: true });
    try {
      const plans = await plansApi.list();
      set({ plans, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  openCreateEditor: () =>
    set({
      editorOpen: true,
      editorMode: "create",
      selectedPlan: null,
    }),

  openEditEditor: (plan) =>
    set({
      editorOpen: true,
      editorMode: "edit",
      selectedPlan: plan,
    }),

  openViewEditor: (plan) =>
    set({
      editorOpen: true,
      editorMode: "view",
      selectedPlan: plan,
    }),

  closeEditor: () =>
    set({
      editorOpen: false,
      selectedPlan: null,
    }),

  openDeleteModal: (plan) => set({ deleteModalOpen: true, planToDelete: plan }),
  closeDeleteModal: () => set({ deleteModalOpen: false, planToDelete: null }),

  addPlan: async (planData) => {
    const created = await plansApi.create(planData);
    set((state) => ({
      plans: [...state.plans, created].sort((a, b) => a.displayOrder - b.displayOrder),
      editorOpen: false,
      selectedPlan: null,
    }));
    return created;
  },

  updatePlan: async (id, data) => {
    const updated = await plansApi.update(id, data);
    set((state) => ({
      plans: state.plans
        .map((p) => (p.id === id ? updated : p))
        .sort((a, b) => a.displayOrder - b.displayOrder),
      editorOpen: false,
      selectedPlan: null,
    }));
    return updated;
  },

  deletePlan: async (id) => {
    await plansApi.remove(id);
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
      deleteModalOpen: false,
      planToDelete: null,
    }));
  },

  duplicatePlan: async (plan) => {
    const created = await plansApi.create({
      name: `${plan.name} (Copy)`,
      slug: plan.slug ? `${plan.slug}-copy` : undefined,
      description: plan.description ?? undefined,
      type: plan.type,
      price: plan.originalPrice ?? plan.price,
      validityDays: plan.validityDays,
      deliveriesPerCycle: plan.deliveriesPerCycle,
      itemRules: plan.itemRules,
      isActive: false,
      displayOrder: plan.displayOrder + 1,
      badge: plan.badge ?? undefined,
      skipEnabled: plan.skipEnabled,
      monthlySkipLimit: plan.monthlySkipLimit,
      weeklySkipLimit: plan.weeklySkipLimit,
      maxSkipDaysPerCycle: plan.maxSkipDaysPerCycle,
      skipCutoffHours: plan.skipCutoffHours,
      carryForwardEnabled: plan.carryForwardEnabled,
      carryForwardMode: plan.carryForwardMode,
      allowAdminOverride: plan.allowAdminOverride,
      discountType: plan.discountType,
      discountValue: plan.discountValue,
      discountLabel: plan.discountLabel ?? undefined,
      isDiscountActive: plan.isDiscountActive,
    });
    set((state) => ({
      plans: [...state.plans, created].sort((a, b) => a.displayOrder - b.displayOrder),
    }));
  },

  toggleActive: async (id, isActive) => {
    const updated = await plansApi.update(id, { isActive });
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? updated : p)),
    }));
  },

  getFilteredPlans: () => {
    const { plans, searchQuery, statusFilter } = get();
    let filtered = [...plans];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.slug ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => !p.isActive);
    }

    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getStats: () => {
    const { plans } = get();
    return {
      total: plans.length,
      active: plans.filter((p) => p.isActive).length,
      inactive: plans.filter((p) => !p.isActive).length,
      weekly: plans.filter((p) => p.type === "WEEKLY").length,
      monthly: plans.filter((p) => p.type === "MONTHLY").length,
    };
  },
}));
