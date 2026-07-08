import { create } from 'zustand';
import { KitchenOrder, OrderStatus, Priority, DeliverySlot, PaymentMethod, KitchenFilters, KitchenStats, COLUMN_ORDER } from '../types/kitchen';
import { mockOrders, mockAlerts } from '../mock/kitchen-orders';

interface KitchenStore {
  orders: KitchenOrder[];
  alerts: typeof mockAlerts;
  currentSlot: DeliverySlot;
  selectedOrder: KitchenOrder | null;
  drawerOpen: boolean;
  filters: KitchenFilters;

  setCurrentSlot: (slot: DeliverySlot) => void;
  setSelectedOrder: (order: KitchenOrder | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setSearch: (query: string) => void;
  toggleFilter: (type: 'priority' | 'deliverySlot' | 'paymentMethod', value: Priority | DeliverySlot | PaymentMethod) => void;
  clearFilters: () => void;
  moveOrder: (orderId: string, newStatus: OrderStatus) => void;
  reorderOrders: (status: OrderStatus, oldIndex: number, newIndex: number) => void;
  startCooking: (orderId: string) => void;
  markReady: (orderId: string) => void;
  markPacked: (orderId: string) => void;
  dispatchOrder: (orderId: string) => void;
  getFilteredOrders: () => KitchenOrder[];
  getOrdersByStatus: (status: OrderStatus) => KitchenOrder[];
  getStats: () => KitchenStats;
}

const initialFilters: KitchenFilters = {
  priority: [],
  deliverySlot: [],
  paymentMethod: [],
  search: '',
};

export const useKitchenStore = create<KitchenStore>((set, get) => ({
  orders: mockOrders,
  alerts: mockAlerts,
  currentSlot: 'lunch',
  selectedOrder: null,
  drawerOpen: false,
  filters: { ...initialFilters },

  setCurrentSlot: (slot) => set({ currentSlot: slot }),

  setSelectedOrder: (order) => set({ selectedOrder: order, drawerOpen: !!order }),

  setDrawerOpen: (open) => set({ drawerOpen: open, selectedOrder: open ? get().selectedOrder : null }),

  setSearch: (query) => set((state) => ({ filters: { ...state.filters, search: query } })),

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

  moveOrder: (orderId, newStatus) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status: newStatus,
            preparationStartedAt: newStatus === 'preparing' ? Date.now() : order.preparationStartedAt,
          }
        : order
    ),
  })),

  reorderOrders: (status, oldIndex, newIndex) => set((state) => {
    const statusOrders = state.orders.filter((o) => o.status === status);
    const otherOrders = state.orders.filter((o) => o.status !== status);
    const [moved] = statusOrders.splice(oldIndex, 1);
    statusOrders.splice(newIndex, 0, moved);
    return { orders: [...otherOrders, ...statusOrders] };
  }),

  startCooking: (orderId) => {
    get().moveOrder(orderId, 'preparing');
  },

  markReady: (orderId) => {
    get().moveOrder(orderId, 'ready');
  },

  markPacked: (orderId) => {
    get().moveOrder(orderId, 'packed');
  },

  dispatchOrder: (orderId) => {
    get().moveOrder(orderId, 'dispatched');
  },

  getFilteredOrders: () => {
    const { orders, currentSlot, filters } = get();
    let filtered = orders.filter((o) => o.deliverySlot === currentSlot);

    if (filters.priority.length > 0) {
      filtered = filtered.filter((o) => filters.priority.includes(o.priority));
    }
    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter((o) => filters.paymentMethod.includes(o.paymentMethod));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  getOrdersByStatus: (status) => {
    return get().getFilteredOrders().filter((o) => o.status === status);
  },

  getStats: () => {
    const orders = get().getFilteredOrders();
    const delayed = orders.filter((o) => {
      if (!o.preparationStartedAt) return false;
      const elapsed = (Date.now() - o.preparationStartedAt) / 60000;
      return elapsed > o.estimatedCompletionMinutes && o.status !== 'dispatched';
    });
    const preparing = orders.filter((o) => o.status === 'preparing');
    const avgPrepTime = preparing.length > 0
      ? Math.round(preparing.reduce((sum, o) => {
          if (!o.preparationStartedAt) return sum;
          return sum + (Date.now() - o.preparationStartedAt) / 60000;
        }, 0) / preparing.length)
      : 0;

    return {
      pending: orders.filter((o) => o.status === 'new').length,
      preparing: preparing.length,
      ready: orders.filter((o) => o.status === 'ready').length,
      packed: orders.filter((o) => o.status === 'packed').length,
      dispatched: orders.filter((o) => o.status === 'dispatched').length,
      delayed: delayed.length,
      avgPrepTime,
    };
  },
}));
