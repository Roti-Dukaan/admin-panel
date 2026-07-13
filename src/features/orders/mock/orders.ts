import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderType,
  PaymentInfo,
  Customer,
  OrderItem,
  DeliveryInfo,
  OrderTimelineEntry,
} from "../types/order"

export const mockOrders: Order[] = []

export const mockStatistics = {
  todayOrders: 0,
  preparing: 0,
  packed: 0,
  outForDelivery: 0,
  delivered: 0,
  cancelled: 0,
  totalRevenueToday: 0,
}