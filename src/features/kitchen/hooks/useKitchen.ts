import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { kitchenApi } from "@/lib/api/kitchen.api";
import type { KitchenOrder, OrderStatus, Priority, DeliverySlot, PaymentMethod, KitchenFilters, KitchenStats } from "../types/kitchen";

interface KitchenStore {
  orders: KitchenOrder[];
  currentSlot: DeliverySlot;
  selectedOrder: KitchenOrder | null;
  drawerOpen: boolean;
  filters: KitchenFilters;

  setCurrentSlot: (slot: DeliverySlot) => void;
  setSelectedOrder: (order: KitchenOrder | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setSearch: (query: string) => void;
  toggleFilter: (type: "priority" | "deliverySlot" | "paymentMethod", value: Priority | DeliverySlot | PaymentMethod) => void;
  clearFilters: () => void;
  moveOrder: (orderId: string, newStatus: OrderStatus) => void;
  getStats: () => KitchenStats;
}

const initialFilters: KitchenFilters = {
  priority: [],
  deliverySlot: [],
  paymentMethod: [],
  search: "",
};

export const useKitchenStore = create<KitchenStore>((set, get) => ({
  orders: [],
  currentSlot: "lunch",
  selectedOrder: null,
  drawerOpen: false,
  filters: { ...initialFilters },

  setCurrentSlot: (slot) => set({ currentSlot: slot }),

  setSelectedOrder: (order) => set({ selectedOrder: order, drawerOpen: !!order }),

  setDrawerOpen: (open) => set({ drawerOpen: open, selectedOrder: open ? get().selectedOrder : null }),

  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),

  toggleFilter: (type, value) => set((state) => {
    const current = state.filters[type];
    const exists = current.includes(value as never);
    return {
      filters: {
        ...state.filters,
        [type]: exists ? current.filter((v) => v !== value) : [...current, value],
      },
    };
  }),

  clearFilters: () => set({ filters: { ...initialFilters } }),

  moveOrder: (orderId, newStatus) => {
    // This will be handled by React Query mutation
    console.log("moveOrder - use API mutation instead");
  },

  getStats: () => {
    const { orders } = get();
    const preparing = orders.filter((o) => o.status === "preparing");
    const avgPrepTime = preparing.length > 0
      ? Math.round(preparing.reduce((sum, o) => {
          if (!o.preparationStartedAt) return sum;
          return sum + (Date.now() - o.preparationStartedAt) / 60000;
        }, 0) / preparing.length)
      : 0;

    return {
      pending: orders.filter((o) => o.status === "new").length,
      preparing: preparing.length,
      ready: orders.filter((o) => o.status === "ready").length,
      packed: orders.filter((o) => o.status === "packed").length,
      dispatched: orders.filter((o) => o.status === "dispatched").length,
      delayed: 0,
      avgPrepTime,
    };
  },
}));

interface KitchenListParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}

function mapBackendTicketToKitchenOrder(ticket: any): KitchenOrder {
  const statusMap: Record<string, OrderStatus> = {
    PENDING: "new",
    ACCEPTED: "preparing",
    PREPARING: "preparing",
    READY: "ready",
    DISPATCHED: "dispatched",
    CANCELLED: "ready",
  };

  const priorityMap: Record<string, Priority> = {
    NORMAL: "normal",
    HIGH: "vip",
    URGENT: "express",
  };

  const deliverySlotMap = (ticket.order?.deliverySlot?.name?.toLowerCase() || "lunch") as DeliverySlot;

  return {
    id: ticket.id,
    orderNumber: ticket.order?.orderNumber || ticket.ticketNumber || "N/A",
    customerName: ticket.order?.customer?.fullName || ticket.order?.customer?.name || "Guest",
    customerPhone: ticket.order?.customer?.phone || "",
    customerAddress: ticket.deliveryAddress || "",
    items: (ticket.items || []).map((item: any) => ({
      name: item.foodNameSnapshot,
      quantity: item.quantity,
      emoji: "🍽️",
    })),
    status: statusMap[ticket.status] || "new",
    deliverySlot: deliverySlotMap,
    priority: priorityMap[ticket.priority] || "normal",
    paymentMethod: "online" as PaymentMethod,
    cookingPreference: "regular",
    specialInstructions: ticket.order?.specialInstructions ? [ticket.order.specialInstructions] : [],
    preparationStartedAt: ticket.startedAt ? new Date(ticket.startedAt).getTime() : null,
    estimatedCompletionMinutes: ticket.estimatedPreparationMinutes || 20,
    createdAt: new Date(ticket.createdAt).getTime(),
    isSubscription: false,
    preparationNotes: "",
  };
}

export function useKitchenKanban() {
  const currentSlot = useKitchenStore((s) => s.currentSlot);

  return useQuery({
    queryKey: ["kitchen", "kanban", currentSlot],
    queryFn: async () => {
      const data = await kitchenApi.getKanban();
      const mapped = {
        PENDING: (data.PENDING || []).map(mapBackendTicketToKitchenOrder),
        ACCEPTED: (data.ACCEPTED || []).map(mapBackendTicketToKitchenOrder),
        PREPARING: (data.PREPARING || []).map(mapBackendTicketToKitchenOrder),
        READY: (data.READY || []).map(mapBackendTicketToKitchenOrder),
        DISPATCHED: (data.DISPATCHED || []).map(mapBackendTicketToKitchenOrder),
        CANCELLED: (data.CANCELLED || []).map(mapBackendTicketToKitchenOrder),
      };
      // Update zustand store with orders for getStats
      useKitchenStore.setState({ orders: [...mapped.PENDING, ...mapped.ACCEPTED, ...mapped.PREPARING, ...mapped.READY, ...mapped.DISPATCHED, ...mapped.CANCELLED] });
      return mapped;
    },
    staleTime: 30_000,
    placeholderData: (previousData: any) => previousData,
  });
}

export function useKitchenList(filters?: KitchenListParams) {
  return useQuery({
    queryKey: ["kitchen", "list", filters],
    queryFn: async () => {
      const data = await kitchenApi.list(filters);
      return {
        orders: data.items.map(mapBackendTicketToKitchenOrder),
        total: data.total,
        page: data.page,
        limit: data.limit,
      };
    },
    staleTime: 30_000,
    placeholderData: (previousData: any) => previousData,
  });
}

export function useKitchenTicket(id: string | null) {
  return useQuery({
    queryKey: ["kitchen", "ticket", id],
    queryFn: () => kitchenApi.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useKitchenTimeline(id: string | null) {
  return useQuery({
    queryKey: ["kitchen", "timeline", id],
    queryFn: () => kitchenApi.getTimeline(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateKitchenStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: string; remarks?: string }) =>
      kitchenApi.updateStatus(id, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen"] });
    },
  });
}

export function useCancelKitchenTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kitchenApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen"] });
    },
  });
}