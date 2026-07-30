import { apiClient } from './http';
import type { ApiResponse, PaginatedData } from '../types/api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_BRANCH' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ORDER_NOT_RECEIVED' | 'LATE_DELIVERY' | 'WRONG_ITEM' | 'MISSING_ITEM' | 'FOOD_QUALITY' | 'DAMAGED_PACKAGE' | 'PAYMENT' | 'REFUND' | 'SUBSCRIPTION' | 'ACCOUNT' | 'PROMOTION' | 'OTHER';
export type TicketSource = 'APP' | 'PHONE' | 'WHATSAPP' | 'EMAIL' | 'ADMIN';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  orderId?: string;
  branchId?: string;
  assignedToId?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  subject: string;
  description: string;
  resolution?: string;
  customerRating?: number;
  customerFeedback?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; phone: string; email?: string };
  order?: { id: string; orderNumber: string; status: string; grandTotal: number };
  branch?: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  messages?: SupportMessage[];
  activities?: SupportActivity[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderType: string;
  senderId?: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: SupportAttachment[];
}

export interface SupportAttachment {
  id: string;
  url: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface SupportActivity {
  id: string;
  action: string;
  performedBy: string;
  performedByType: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface SupportDashboard {
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  avgResolutionTimeHours: number;
  customerSatisfaction: number;
  highPriorityTickets: number;
  ticketsByBranch: Array<{ branchId: string; branchName: string; count: number }>;
  ticketsByCategory: Array<{ category: string; count: number }>;
  ticketsByExecutive: Array<{ executiveId: string; executiveName: string; count: number }>;
}

export interface SupportQueryParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  branchId?: string;
  assignedToId?: string;
  customerId?: string;
  search?: string;
  orderNumber?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const supportApi = {
  async list(params?: SupportQueryParams): Promise<ApiResponse<PaginatedData<SupportTicket>>> {
    const { data } = await apiClient.get('/admin/support', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.get(`/admin/support/${id}`);
    return data;
  },

  async getDashboard(): Promise<ApiResponse<SupportDashboard>> {
    const { data } = await apiClient.get('/admin/support/dashboard');
    return data;
  },

  async search(query: string): Promise<ApiResponse<SupportTicket[]>> {
    const { data } = await apiClient.get('/admin/support/search', { params: { q: query } });
    return data;
  },

  async update(id: string, params: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToId?: string;
    branchId?: string;
    resolution?: string;
  }): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.patch(`/admin/support/${id}`, params);
    return data;
  },

  async assign(id: string, assignedToId: string, branchId?: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.patch(`/admin/support/${id}/assign`, { assignedToId, branchId });
    return data;
  },

  async updateStatus(id: string, status: TicketStatus, remarks?: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.patch(`/admin/support/${id}/status`, { status, remarks });
    return data;
  },

  async addInternalNote(id: string, message: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.post(`/admin/support/${id}/internal-note`, { message });
    return data;
  },

  async addReply(id: string, message: string): Promise<ApiResponse<SupportTicket>> {
    const { data } = await apiClient.post(`/admin/support/${id}/reply`, { message });
    return data;
  },

  async uploadAttachment(id: string, file: File): Promise<ApiResponse<SupportTicket>> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/admin/support/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getCustomerOrders(customerId: string, page = 1, limit = 10): Promise<ApiResponse<{
    items: Array<{ id: string; orderNumber: string; status: string; grandTotal: number; createdAt: string }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    const { data } = await apiClient.get(`/admin/support/customer/${customerId}/orders`, { params: { page, limit } });
    return data;
  },
};
