import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Order, OrderStatistics, OrderFilters, OrderDatePreset, OrderStatus, PaymentStatus } from "../types/order";
import { ordersApi } from "@/lib/api/orders.api";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { normalizeOrderStatus, toBackendOrderStatus } from "../utils/status";

function normalizeOrder(order: Record<string, unknown>): Order {
  const timeline = Array.isArray(order.timeline)
    ? order.timeline.map((entry) => {
        const e = entry as Record<string, unknown>;
        return {
          ...e,
          status: normalizeOrderStatus(String(e.status ?? "")),
        };
      })
    : [];

  return {
    ...(order as Order),
    status: normalizeOrderStatus(String(order.status ?? "")),
    timeline,
  };
}

function getBranchScope(): string | undefined {
  const { role, branchId } = useAdminAuthStore.getState();
  return role === "BRANCH_MANAGER" && branchId ? branchId : undefined;
}

interface OrderStore {
  orders: Order[];
  selectedOrder: Order | null;
  statistics: OrderStatistics | null;
  filters: OrderFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  statisticsLoading: boolean;
  drawerOpen: boolean;
  updatingStatus: string | null;

  setFilters: (filters: Partial<OrderFilters>) => void;
  setDateRange: (preset: OrderDatePreset, startDate?: string, endDate?: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSelectedOrder: (order: Order | null) => void;
  setDrawerOpen: (open: boolean) => void;
  fetchOrders: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const defaultFilters: OrderFilters = {
  dateFilter: "today",
  customStartDate: "",
  customEndDate: "",
  status: "all",
  paymentMethod: "all",
  paymentStatus: "all",
  orderType: "all",
  search: "",
  branchId: "all",
  cityId: "all",
  areaId: "all",
};

export const useOrdersStore = create<OrderStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  statistics: null,
  filters: { ...defaultFilters },
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  loading: false,
  statisticsLoading: false,
  drawerOpen: false,
  updatingStatus: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchOrders();
  },

  setDateRange: (preset, startDate = "", endDate = "") => {
    set((state) => ({
      filters: {
        ...state.filters,
        dateFilter: preset,
        customStartDate: startDate,
        customEndDate: endDate,
      },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchOrders();
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    get().fetchOrders();
  },

  setPageSize: (pageSize) => {
    set((state) => ({ pagination: { ...state.pagination, pageSize, page: 1 } }));
    get().fetchOrders();
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  fetchOrders: async () => {
    const { filters, pagination } = get();
    const branchScope = getBranchScope();
    set({ loading: true });
    try {
      const data = await ordersApi.list({
        page: pagination.page,
        limit: pagination.pageSize,
        status: filters.status,
        paymentMethod: filters.paymentMethod,
        paymentStatus: filters.paymentStatus,
        orderType: filters.orderType,
        search: filters.search,
        dateFilter: filters.dateFilter,
        customStartDate: filters.customStartDate,
        customEndDate: filters.customEndDate,
        branchId:
          (filters.branchId && filters.branchId !== "all" ? filters.branchId : undefined) ||
          branchScope,
        cityId: filters.cityId && filters.cityId !== "all" ? filters.cityId : undefined,
        areaId: filters.areaId && filters.areaId !== "all" ? filters.areaId : undefined,
      });
      set({
        orders: (data.items as Record<string, unknown>[]).map(normalizeOrder),
        pagination: {
          ...pagination,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit) || 0,
        },
        loading: false,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to fetch orders";
      console.error("Failed to fetch orders:", error);
      toast.error(message);
      set({ loading: false });
    }
  },

  fetchStatistics: async () => {
    set({ statisticsLoading: true });
    try {
      const data = await ordersApi.getStats(getBranchScope());
      set({ statistics: data as OrderStatistics, statisticsLoading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to fetch statistics";
      console.error("Failed to fetch statistics:", error);
      toast.error(message);
      set({ statisticsLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ updatingStatus: orderId });
    try {
      await ordersApi.updateStatus(orderId, { status: toBackendOrderStatus(status) });
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        selectedOrder: state.selectedOrder?.id === orderId ? { ...state.selectedOrder, status } : state.selectedOrder,
        updatingStatus: null,
      }));
    } catch (error) {
      console.error("Failed to update order status:", error);
      set({ updatingStatus: null });
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    set({ updatingStatus: orderId });
    try {
      await ordersApi.updateStatus(orderId, {
        status: "CANCELLED",
        remarks: "Cancelled by admin",
      });
      set((state) => ({
        orders: state.orders.map((o) => o.id === orderId ? { ...o, status: "cancelled" } : o),
        selectedOrder: state.selectedOrder?.id === orderId ? { ...state.selectedOrder, status: "cancelled" } : state.selectedOrder,
        updatingStatus: null,
      }));
    } catch (error) {
      console.error("Failed to cancel order:", error);
      set({ updatingStatus: null });
      throw error;
    }
  },

  refreshAll: async () => {
    await Promise.all([get().fetchOrders(), get().fetchStatistics()]);
  },
}));

// React Query hooks for external use
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await ordersApi.list();
      return data;
    },
    staleTime: 30_000,
  });
}