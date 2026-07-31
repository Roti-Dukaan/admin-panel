import { create } from "zustand";
import { toast } from "sonner";
import {
  Coupon,
  CouponStatusFilter,
  CreateCouponInput,
  UpdateCouponInput,
} from "../types/coupon";
import { couponsApi } from "../services/coupons.api";

interface CouponStore {
  coupons: Coupon[];
  loading: boolean;
  searchQuery: string;
  statusFilter: CouponStatusFilter;
  editorOpen: boolean;
  editorMode: "create" | "edit";
  selectedCoupon: Coupon | null;

  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: CouponStatusFilter) => void;
  loadCoupons: () => Promise<void>;
  openCreateEditor: () => void;
  openEditEditor: (coupon: Coupon) => void;
  closeEditor: () => void;
  createCoupon: (input: CreateCouponInput) => Promise<void>;
  updateCoupon: (id: string, input: UpdateCouponInput) => Promise<void>;
  toggleActive: (coupon: Coupon) => Promise<void>;
  getFilteredCoupons: () => Coupon[];
}

export const useCouponStore = create<CouponStore>((set, get) => ({
  coupons: [],
  loading: false,
  searchQuery: "",
  statusFilter: "all",
  editorOpen: false,
  editorMode: "create",
  selectedCoupon: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  loadCoupons: async () => {
    set({ loading: true });
    try {
      const coupons = await couponsApi.list();
      set({ coupons, loading: false });
    } catch {
      set({ loading: false });
      toast.error("Failed to load coupons");
    }
  },

  openCreateEditor: () =>
    set({ editorOpen: true, editorMode: "create", selectedCoupon: null }),
  openEditEditor: (selectedCoupon) =>
    set({ editorOpen: true, editorMode: "edit", selectedCoupon }),
  closeEditor: () => set({ editorOpen: false, selectedCoupon: null }),

  createCoupon: async (input) => {
    const created = await couponsApi.create(input);
    set((s) => ({ coupons: [created, ...s.coupons] }));
    toast.success("Coupon created");
  },

  updateCoupon: async (id, input) => {
    const updated = await couponsApi.update(id, input);
    set((s) => ({
      coupons: s.coupons.map((c) => (c.id === id ? updated : c)),
    }));
    toast.success("Coupon updated");
  },

  toggleActive: async (coupon) => {
    const updated = await couponsApi.update(coupon.id, { active: !coupon.active });
    set((s) => ({
      coupons: s.coupons.map((c) => (c.id === coupon.id ? updated : c)),
    }));
    toast.success(updated.active ? "Coupon activated" : "Coupon deactivated");
  },

  getFilteredCoupons: () => {
    const { coupons, searchQuery, statusFilter } = get();
    const q = searchQuery.trim().toLowerCase();
    return coupons.filter((c) => {
      if (statusFilter === "active" && !c.active) return false;
      if (statusFilter === "inactive" && c.active) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
      );
    });
  },
}));
