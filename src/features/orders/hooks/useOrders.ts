import { create } from "zustand";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatistics, OrderFilters, OrderDatePreset, OrderStatus, PaymentStatus } from "../types/order";
import { ordersApi } from "@/lib/api/orders.api";

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
  dateFilter: "all",
  customStartDate: "",
  customEndDate: "",
  status: "all",
  paymentMethod: "all",
  paymentStatus: "all",
  orderType: "all",
  search: "",
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

  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),

  setPageSize: (pageSize) =>
    set((state) => ({ pagination: { ...state.pagination, pageSize, page: 1 } })),

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  fetchOrders: async () => {
    const { filters, pagination } = get();
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
      });
      set({
        orders: data.items as Order[],
        pagination: {
          ...pagination,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit) || 0,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ loading: false });
    }
  },

  fetchStatistics: async () => {
    set({ statisticsLoading: true });
    try {
      const data = await ordersApi.getStats();
      set({ statistics: data as OrderStatistics, statisticsLoading: false });
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      set({ statisticsLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ updatingStatus: orderId });
    // Convert kebab-case to SNAKE_CASE for backend
    const backendStatus = status.toUpperCase().replace(/-/g, '_');
    try {
      await ordersApi.updateStatus(orderId, { status: backendStatus });
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        selectedOrder: state.selectedOrder?.id === orderId ? { ...state.selectedOrder, status } : state.selectedOrder,
        updatingStatus: null,
      }));
    } catch (error) {
      console.error("Failed to update order status:", error);
      set({ updatingStatus: null });
    }
  },

  cancelOrder: async (orderId) => {
    set({ updatingStatus: orderId });
    try {
      // Backend doesn't have cancel endpoint in orders.api, use direct API call
      const { apiClient } = await import("@/lib/api/http");
      await apiClient.post(`/admin/orders/${orderId}/cancel`, { reason: "Cancelled by admin" });
      set((state) => ({
        orders: state.orders.map((o) => o.id === orderId ? { ...o, status: "cancelled" } : o),
        selectedOrder: state.selectedOrder?.id === orderId ? { ...state.selectedOrder, status: "cancelled" } : state.selectedOrder,
        updatingStatus: null,
      }));
    } catch (error) {
      console.error("Failed to cancel order:", error);
      set({ updatingStatus: null });
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