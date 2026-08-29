import { apiClient } from './http';
import type { ApiResponse, PaginatedData } from '../types/api';

export type RefundStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'CANCELLED';

export type RefundType =
  | 'FULL_ORDER_CANCELLATION'
  | 'PARTIAL_SUPPORT_REFUND'
  | 'FULL_SUPPORT_REFUND'
  | 'MANUAL_ADMIN_REFUND';

export interface RefundRecord {
  id: string;
  refundNo: string;
  orderId?: string;
  orderNo?: string;
  customerId: string;
  customerName?: string;
  supportTicketId?: string;
  supportTicketNo?: string;
  refundType: RefundType;
  reasonCategory: string;
  reasonDetails?: string;
  customerVisibleNote?: string;
  requestedAmount: number;
  approvedAmount?: number;
  refundedAmount?: number;
  status: RefundStatus;
  razorpayRefundId?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface RefundEligibility {
  orderNo?: string;
  paymentStatus?: string;
  originalPaymentAmount: number;
  completedRefundAmount: number;
  processingRefundAmount: number;
  remainingRefundableAmount: number;
  eligible: boolean;
  reason?: string;
}

export const refundsApi = {
  list(params?: Record<string, string | number | undefined>) {
    return apiClient.get<ApiResponse<PaginatedData<RefundRecord>>>('/admin/refunds', { params });
  },
  getById(refundId: string) {
    return apiClient.get<ApiResponse<RefundRecord>>(`/admin/refunds/${refundId}`);
  },
  getEligibility(orderId: string) {
    return apiClient.get<ApiResponse<RefundEligibility>>(`/admin/orders/${orderId}/refund-eligibility`);
  },
  preview(ticketId: string, body: Record<string, unknown>) {
    return apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/admin/support/tickets/${ticketId}/refunds/preview`,
      body,
    );
  },
  create(ticketId: string, body: Record<string, unknown>) {
    return apiClient.post<ApiResponse<RefundRecord>>(
      `/admin/support/tickets/${ticketId}/refunds`,
      body,
    );
  },
  approve(ticketId: string, refundId: string) {
    return apiClient.post<ApiResponse<RefundRecord>>(
      `/admin/support/tickets/${ticketId}/refunds/${refundId}/approve`,
    );
  },
  reject(ticketId: string, refundId: string, reason?: string) {
    return apiClient.post<ApiResponse<RefundRecord>>(
      `/admin/support/tickets/${ticketId}/refunds/${refundId}/reject`,
      { reason },
    );
  },
  listForTicket(ticketId: string) {
    return apiClient.get<ApiResponse<PaginatedData<RefundRecord>>>(
      `/admin/support/tickets/${ticketId}/refunds`,
    );
  },
};
