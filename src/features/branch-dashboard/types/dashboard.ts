export interface RevenueTrendDay {
  day: string
  date: string
  revenue: number
}

export interface BranchDashboardStats {
  totalOrdersToday: number
  totalRevenueToday: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  outForDelivery: number
  deliveredToday: number
  cancelledToday: number
  kitchenStatus?: string
  activeTickets?: number
  ordersChangePercent?: number | null
  revenueChangePercent?: number | null
  revenueTrend: RevenueTrendDay[]
  maxRevenue: number
  date: string
}
