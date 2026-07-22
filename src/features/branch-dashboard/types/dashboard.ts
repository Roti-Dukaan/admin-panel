export interface BranchDashboardStats {
  totalOrdersToday: number
  totalRevenueToday: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  kitchenStatus?: string
  activeTickets?: number
  date: string
}
