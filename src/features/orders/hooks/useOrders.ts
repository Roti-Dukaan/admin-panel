import { create } from "zustand"
import type {
  Order,
  OrderStatistics,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
} from "../types/order"
import { mockOrders, mockStatistics } from "../mock/orders"

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
  paymentStatus: "all",
  orderType: "all",
  search: "",
}

function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  let filtered = [...orders]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.payment.transactionId?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    )
  }

  if (filters.status !== "all") {
    filtered = filtered.filter((o) => o.status === filters.status)
  }

  if (filters.paymentMethod !== "all") {
    filtered = filtered.filter((o) => o.payment.method === filters.paymentMethod)
  }

  if (filters.paymentStatus !== "all") {
    filtered = filtered.filter((o) => o.payment.status === filters.paymentStatus)
  }

  if (filters.orderType !== "all") {
    filtered = filtered.filter((o) => o.orderType === filters.orderType)
  }

  if (filters.dateFilter !== "all") {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter((o) => {
      const orderDate = new Date(o.createdAt)
      switch (filters.dateFilter) {
        case "today":
          return orderDate >= startOfDay
        case "tomorrow": {
          const tomorrow = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          const dayAfter = new Date(startOfDay.getTime() + 48 * 60 * 60 * 1000)
          return orderDate >= tomorrow && orderDate < dayAfter
        }
        case "this_week": {
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo
        }
        default:
          return true
      }
    })
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
  },

  setPageSize: (pageSize) => {
    set((state) => ({
      pagination: { ...state.pagination, pageSize, page: 1 },
    }))
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  fetchOrders: async () => {
    const { filters, pagination } = get()
    set({ loading: true })
    try {
      await new Promise((r) => setTimeout(r, 300))
      const filtered = filterOrders(mockOrders, filters)
      const totalPages = Math.ceil(filtered.length / pagination.pageSize)
      const start = (pagination.page - 1) * pagination.pageSize
      const paginatedData = filtered.slice(start, start + pagination.pageSize)

      set({
        orders: paginatedData,
        pagination: {
          ...pagination,
          total: filtered.length,
          totalPages,
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
      await new Promise((r) => setTimeout(r, 200))
      set({ statistics: mockStatistics })
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    } finally {
      set({ statisticsLoading: false })
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ updatingStatus: orderId })
    try {
      await new Promise((r) => setTimeout(r, 400))
      const order = mockOrders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
        order.timeline.push({
          status,
          timestamp: new Date().toISOString(),
          label: status.replace(/_/g, " "),
        })
      }
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status, timeline: order?.timeline || o.timeline } : o)),
        selectedOrder:
          state.selectedOrder?.id === orderId
            ? { ...state.selectedOrder, status, timeline: order?.timeline || state.selectedOrder.timeline }
            : state.selectedOrder,
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
      await new Promise((r) => setTimeout(r, 400))
      const order = mockOrders.find((o) => o.id === orderId)
      if (order) {
        order.status = "cancelled"
        order.payment.status = order.payment.method === "cod" ? "failed" : "failed"
        order.timeline.push({
          status: "cancelled",
          timestamp: new Date().toISOString(),
          label: "Cancelled",
        })
      }
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" as OrderStatus, payment: { ...o.payment, status: "failed" as PaymentStatus }, timeline: order?.timeline || o.timeline } : o
        ),
        selectedOrder:
          state.selectedOrder?.id === orderId
            ? { ...state.selectedOrder, status: "cancelled" as OrderStatus, payment: { ...state.selectedOrder.payment, status: "failed" as PaymentStatus }, timeline: order?.timeline || state.selectedOrder.timeline }
            : state.selectedOrder,
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
