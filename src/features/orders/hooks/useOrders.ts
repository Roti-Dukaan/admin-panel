import { create } from "zustand"
import type {
  Order,
  OrderStatistics,
  OrderFilters,
  OrderStatus,
  PaginatedResponse,
} from "../types/order"
import { ordersService } from "../services/orders.service"

interface OrdersState {
  orders: Order[]
  selectedOrder: Order | null
  statistics: OrderStatistics | null
  filters: OrderFilters
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  loading: boolean
  statisticsLoading: boolean
  drawerOpen: boolean
  updatingStatus: string | null

  setFilters: (filters: Partial<OrderFilters>) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSelectedOrder: (order: Order | null) => void
  setDrawerOpen: (open: boolean) => void
  fetchOrders: () => Promise<void>
  fetchStatistics: () => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  cancelOrder: (orderId: string, reason?: string) => Promise<void>
  refreshAll: () => Promise<void>
}

const defaultFilters: OrderFilters = {
  dateFilter: "all",
  status: "all",
  paymentMethod: "all",
  orderType: "all",
  search: "",
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
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
    }))
    get().fetchOrders()
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
    get().fetchOrders()
  },

  setPageSize: (pageSize) => {
    set((state) => ({
      pagination: { ...state.pagination, pageSize, page: 1 },
    }))
    get().fetchOrders()
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  fetchOrders: async () => {
    const { filters, pagination } = get()
    set({ loading: true })
    try {
      const result = await ordersService.getOrders(
        filters,
        pagination.page,
        pagination.pageSize
      )
      set({
        orders: result.data,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      })
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      set({ loading: false })
    }
  },

  fetchStatistics: async () => {
    set({ statisticsLoading: true })
    try {
      const stats = await ordersService.getStatistics()
      set({ statistics: stats })
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    } finally {
      set({ statisticsLoading: false })
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ updatingStatus: orderId })
    try {
      const updated = await ordersService.updateOrderStatus(orderId, status)
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
        selectedOrder:
          state.selectedOrder?.id === orderId ? updated : state.selectedOrder,
      }))
    } catch (error) {
      console.error("Failed to update order status:", error)
      throw error
    } finally {
      set({ updatingStatus: null })
    }
  },

  cancelOrder: async (orderId, reason) => {
    set({ updatingStatus: orderId })
    try {
      const updated = await ordersService.cancelOrder(orderId, reason)
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
        selectedOrder:
          state.selectedOrder?.id === orderId ? updated : state.selectedOrder,
      }))
    } catch (error) {
      console.error("Failed to cancel order:", error)
      throw error
    } finally {
      set({ updatingStatus: null })
    }
  },

  refreshAll: async () => {
    await Promise.all([get().fetchOrders(), get().fetchStatistics()])
  },
}))
