import axios from "axios"
import type {
  Order,
  OrderStatistics,
  OrderFilters,
  OrderStatus,
  PaginatedResponse,
  PaymentMethod,
  OrderType,
} from "../types/order"
import { toBackendPaymentMethod, toBackendOrderType } from "../utils/filters"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token")
        window.location.href = "/admin/login"
      }
    }
    return Promise.reject(error)
  }
)

function buildFilterParams(filters: OrderFilters) {
  const params: Record<string, string> = {}
  if (filters.dateFilter !== "all") params.dateFilter = filters.dateFilter
  if (filters.status !== "all") params.status = filters.status
  if (filters.paymentMethod !== "all") params.paymentMethod = toBackendPaymentMethod(filters.paymentMethod as PaymentMethod)
  if (filters.paymentStatus !== "all") params.paymentStatus = filters.paymentStatus
  if (filters.orderType !== "all") params.orderType = toBackendOrderType(filters.orderType as OrderType)
  if (filters.search) params.search = filters.search
  return params
}

export const ordersService = {
  async getOrders(
    filters: OrderFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Order>> {
    const params = {
      ...buildFilterParams(filters),
      page: page.toString(),
      pageSize: pageSize.toString(),
    }
    const { data } = await api.get("/admin/orders", { params })
    return data
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get(`/admin/orders/${id}`)
    return data
  },

  async getStatistics(): Promise<OrderStatistics> {
    const { data } = await api.get("/admin/orders/statistics")
    return data
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await api.patch(`/admin/orders/${id}/status`, { status })
    return data
  },

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const { data } = await api.patch(`/admin/orders/${id}/cancel`, { reason })
    return data
  },

  async exportOrders(filters: OrderFilters): Promise<Blob> {
    const params = buildFilterParams(filters)
    const { data } = await api.get("/admin/orders/export", {
      params,
      responseType: "blob",
    })
    return data
  },
}
