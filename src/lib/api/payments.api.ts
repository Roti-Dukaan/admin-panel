import { apiClient } from './http';
import type { Payment, PaymentFilters, CodRecord, FailedPayment } from '@/features/payments/types/payment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaymentListResponse {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
}

interface PaymentStatsResponse {
  byStatus: { status: string; count: number }[];
  totalCollected: number;
}

/** Convert a date preset (IST-aware) into [dateFrom, dateTo] ISO instants. */
export function resolvePaymentDateRange(
  dateFilter: string | undefined,
  customDateFrom?: string,
  customDateTo?: string,
): { dateFrom?: string; dateTo?: string } {
  if (dateFilter === 'custom') {
    if (!customDateFrom || !customDateTo) return {};
    const start = new Date(`${customDateFrom}T00:00:00+05:30`);
    const end = new Date(`${customDateTo}T23:59:59+05:30`);
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }

  const now = new Date();
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const startOfTodayIst = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate(), 0, 0, 0, 0);
  const startOfTodayUtc = new Date(startOfTodayIst.getTime() - istNow.getTime() + now.getTime());
  const dayMs = 24 * 60 * 60 * 1000;

  switch (dateFilter) {
    case 'today':
      return { dateFrom: startOfTodayUtc.toISOString(), dateTo: new Date(startOfTodayUtc.getTime() + dayMs).toISOString() };
    case 'yesterday':
      return { dateFrom: new Date(startOfTodayUtc.getTime() - dayMs).toISOString(), dateTo: startOfTodayUtc.toISOString() };
    case 'last_7_days':
      return { dateFrom: new Date(startOfTodayUtc.getTime() - 7 * dayMs).toISOString(), dateTo: new Date(startOfTodayUtc.getTime() + dayMs).toISOString() };
    case 'last_30_days':
    default:
      return { dateFrom: new Date(startOfTodayUtc.getTime() - 30 * dayMs).toISOString(), dateTo: new Date(startOfTodayUtc.getTime() + dayMs).toISOString() };
  }
}

function toBackendPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    paid: 'CAPTURED',
    pending: 'CREATED',
    failed: 'FAILED',
    authorized: 'AUTHORIZED',
    refunded: 'REFUNDED',
    cancelled: 'FAILED',
  };
  return map[status] ?? status.toUpperCase();
}

function toBackendPaymentMethod(method: string): string {
  if (method === 'cod') return 'COD';
  if (method === 'upi' || method === 'credit_card' || method === 'debit_card' || method === 'net_banking' || method === 'wallet') {
    return 'ONLINE';
  }
  return method.toUpperCase();
}
function mapBackendStatus(status: string): Payment['paymentStatus'] {
  const map: Record<string, Payment['paymentStatus']> = {
    CAPTURED: 'paid',
    COLLECTED: 'paid',
    SETTLED: 'paid',
    AUTHORIZED: 'authorized',
    CREATED: 'pending',
    PAYMENT_PENDING: 'pending',
    PENDING_COLLECTION: 'pending',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
  };
  return map[status] ?? 'pending';
}

function mapBackendMethod(method: string): Payment['paymentMethod'] {
  const map: Record<string, Payment['paymentMethod']> = {
    ONLINE: 'upi',
    COD: 'cod',
  };
  return map[method] ?? 'upi';
}

function mapBackendPayment(backend: any): Payment {
  return {
    id: backend.id,
    paymentId: backend.paymentReference || backend.id,
    orderId: backend.orderNumber || backend.order?.orderNumber || backend.checkoutReference || '—',
    customerName: backend.customerName || backend.customer?.fullName || backend.customer?.name || 'Guest',
    customerPhone: backend.customerPhone || backend.customer?.phone || '',
    customerEmail: backend.customerEmail || backend.customer?.email || '',
    amount: Number(backend.amount),
    currency: backend.currency || 'INR',
    paymentMethod: mapBackendMethod(backend.paymentMethod),
    paymentStatus: mapBackendStatus(backend.status),
    gateway: backend.provider?.toLowerCase() || 'razorpay',
    transactionTime: new Date(backend.createdAt).getTime(),
    items: backend.items?.map((item: any) => ({
      name: item.foodNameSnapshot,
      quantity: item.quantity,
      price: Number(item.lineTotal) / (item.quantity || 1),
    })) || [],
    subtotal: Number(backend.grandTotal || backend.amount || 0),
    deliveryCharges: 0,
    discount: 0,
    gst: 0,
    grandTotal: Number(backend.grandTotal || backend.amount || 0),
    deliverySlot: backend.deliverySlot || '',
    orderStatus: backend.orderStatus || 'placed',
    deliveryAddress: backend.deliveryAddress || '',
    razorpayInfo: backend.razorpayInfo || null,
    timeline: [],
  };
}

export const paymentsApi = {
  list: async (filters?: Partial<PaymentFilters> & { page?: number; limit?: number }): Promise<Payment[]> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', toBackendPaymentStatus(filters.status));
    if (filters?.method && filters.method !== 'all') params.set('paymentMethod', toBackendPaymentMethod(filters.method));
    if (filters?.gateway && filters.gateway !== 'all') params.set('provider', filters.gateway.toUpperCase());
    if (filters?.search) params.set('search', filters.search);
    params.set('page', String(filters?.page || 1));
    params.set('limit', String(filters?.limit || 20));

    const { dateFrom, dateTo } = resolvePaymentDateRange(
      filters?.dateFilter,
      filters?.customDateFrom,
      filters?.customDateTo,
    );
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    const { data } = await apiClient.get<ApiResponse<PaymentListResponse>>(`/admin/payments?${params.toString()}`);
    if (!data.success) throw new Error(data.message);
    return data.data.items.map(mapBackendPayment);
  },

  getById: async (id: string): Promise<Payment> => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/admin/payments/${encodeURIComponent(id)}`);
    if (!data.success) throw new Error(data.message);
    return mapBackendPayment(data.data);
  },

  getStats: async (): Promise<PaymentStatsResponse> => {
    const { data } = await apiClient.get<ApiResponse<PaymentStatsResponse>>('/admin/payments/stats');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};
