export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export type PaymentMethod = "cod" | "online" | "subscription"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cod_pending" | "cod_collected"
export type OrderType = "one_time" | "subscription"
export type PaymentGateway = "razorpay" | null
export type CodCollectionStatus = "pending" | "collected" | "failed_collection"

export interface Customer {
  id: string
  name: string
  phone: string
  avatar?: string
  totalOrders: number
  subscription?: string
}

export interface OrderItem {
  id: string
  foodName: string
  foodImage?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface DeliveryInfo {
  address: string
  pincode: string
  slot: string
  date: string
  instructions?: string
}

export interface PaymentInfo {
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  gateway?: PaymentGateway
  paymentDateTime?: string
  referenceNumber?: string
  discount: number
  subtotal: number
  taxes: number
  deliveryCharges: number
  grandTotal: number
  cod?: {
    collectionStatus: CodCollectionStatus
    collectionTime?: string
    collectedBy?: string
  }
  paymentTimeline?: {
    initiated?: string
    authorized?: string
    successful?: string
    failed?: string
  }
}

export interface OrderTimelineEntry {
  status: OrderStatus
  timestamp: string
  label: string
}

export interface Order {
  id: string
  orderNumber: string
  customer: Customer
  items: OrderItem[]
  delivery: DeliveryInfo
  payment: PaymentInfo
  status: OrderStatus
  orderType: OrderType
  timeline: OrderTimelineEntry[]
  createdAt: string
  updatedAt: string
}

export interface OrderStatistics {
  todayOrders: number
  preparing: number
  packed: number
  outForDelivery: number
  delivered: number
  cancelled: number
  totalRevenueToday: number
}

export interface OrderFilters {
  dateFilter: "today" | "tomorrow" | "this_week" | "all"
  status: OrderStatus | "all"
  paymentMethod: PaymentMethod | "all"
  paymentStatus: PaymentStatus | "all"
  orderType: OrderType | "all"
  search: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type StatusConfig = {
  label: string
  color: string
  bgClass: string
  textClass: string
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: { label: "Pending", color: "orange", bgClass: "bg-orange-100", textClass: "text-orange-800" },
  accepted: { label: "Accepted", color: "blue", bgClass: "bg-blue-100", textClass: "text-blue-800" },
  preparing: { label: "Preparing", color: "yellow", bgClass: "bg-yellow-100", textClass: "text-yellow-800" },
  packed: { label: "Packed", color: "purple", bgClass: "bg-purple-100", textClass: "text-purple-800" },
  out_for_delivery: { label: "Out for Delivery", color: "indigo", bgClass: "bg-indigo-100", textClass: "text-indigo-800" },
  delivered: { label: "Delivered", color: "green", bgClass: "bg-green-100", textClass: "text-green-800" },
  cancelled: { label: "Cancelled", color: "red", bgClass: "bg-red-100", textClass: "text-red-800" },
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  online: "Online",
  subscription: "Subscription",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cod_pending: "COD Pending",
  cod_collected: "COD Collected",
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { bgClass: string; textClass: string; dotClass: string }> = {
  paid: { bgClass: "bg-emerald-100", textClass: "text-emerald-800", dotClass: "bg-emerald-500" },
  pending: { bgClass: "bg-amber-100", textClass: "text-amber-800", dotClass: "bg-amber-500" },
  failed: { bgClass: "bg-red-100", textClass: "text-red-800", dotClass: "bg-red-500" },
  refunded: { bgClass: "bg-violet-100", textClass: "text-violet-800", dotClass: "bg-violet-500" },
  cod_pending: { bgClass: "bg-orange-100", textClass: "text-orange-800", dotClass: "bg-orange-500" },
  cod_collected: { bgClass: "bg-green-100", textClass: "text-green-800", dotClass: "bg-green-500" },
}

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; color: string; bgClass: string }> = {
  online: { label: "Online", color: "emerald", bgClass: "bg-emerald-50 text-emerald-700" },
  cod: { label: "COD", color: "orange", bgClass: "bg-orange-50 text-orange-700" },
  subscription: { label: "Subscription", color: "violet", bgClass: "bg-violet-50 text-violet-700" },
}
