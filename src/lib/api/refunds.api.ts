import { apiClient } from './http';
import type { ApiResponse, PaginatedData } from '../types/api';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

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
  async list(params?: Record<string, string | number | undefined>) {
    return unwrap(await apiClient.get<PaginatedData<RefundRecord>>('/admin/refunds', { params }));
  },
  async getById(refundId: string) {
    return unwrap(await apiClient.get<RefundRecord>(`/admin/refunds/${refundId}`));
  },
  async getEligibility(orderId: string) {
    return unwrap(await apiClient.get<RefundEligibility>(`/admin/orders/${orderId}/refund-eligibility`));
  },
  async preview(ticketId: string, body: Record<string, unknown>) {
    return unwrap(
      await apiClient.post<Record<string, unknown>>(
        `/admin/support/tickets/${ticketId}/refunds/preview`,
        body,
      ),
    );
  },
  async create(ticketId: string, body: Record<string, unknown>) {
    return unwrap(
      await apiClient.post<RefundRecord>(
        `/admin/support/tickets/${ticketId}/refunds`,
        body,
      ),
    );
  },
  async approve(ticketId: string, refundId: string) {
    return unwrap(
      await apiClient.post<RefundRecord>(
        `/admin/support/tickets/${ticketId}/refunds/${refundId}/approve`,
      ),
    );
  },
  async reject(ticketId: string, refundId: string, reason?: string) {
    return unwrap(
      await apiClient.post<RefundRecord>(
        `/admin/support/tickets/${ticketId}/refunds/${refundId}/reject`,
        { reason },
      ),
    );
  },
  async listForTicket(ticketId: string) {
    return unwrap(
      await apiClient.get<PaginatedData<RefundRecord>>(
        `/admin/support/tickets/${ticketId}/refunds`,
      ),
    );
  },
};
