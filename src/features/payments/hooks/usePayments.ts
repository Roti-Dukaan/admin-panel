import { create } from 'zustand';
import type { Payment, PaymentFilters, CodRecord, FailedPayment, CodCollectionStatus, PaymentMethodType } from '../types/payment';
import { PAYMENT_METHOD_CONFIG } from '../types/payment';
import { paymentsApi } from '@/lib/api/payments.api';

const now = Date.now();

interface PaymentStats {
  todayRevenue: number;
  onlinePayments: number;
  cashOnDelivery: number;
  pendingPayments: number;
  failedPayments: number;
  refundedAmount: number;
  averageOrderValue: number;
  totalTransactions: number;
}

interface CodStats {
  codOrdersToday: number;
  codPendingCollection: number;
  codCollected: number;
  outstandingCod: number;
}

interface PaymentStore {
  payments: Payment[];
  codRecords: CodRecord[];
  failedPayments: FailedPayment[];
  filters: PaymentFilters;
  loading: boolean;
  error: string | null;
  drawerOpen: boolean;
  selectedPayment: Payment | null;

  setFilters: (filters: Partial<PaymentFilters>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;

  openPaymentDrawer: (payment: Payment) => void;
  closePaymentDrawer: () => void;

  getFilteredPayments: () => Payment[];
  getPaymentById: (id: string) => Payment | undefined;
  getStats: () => PaymentStats;
  getCodStats: () => CodStats;
  getFilteredCodRecords: () => CodRecord[];
  getFailedPaymentsList: () => FailedPayment[];
  getRevenueTrend: () => { label: string; online: number; cod: number; total: number }[];
  getMethodDistribution: () => { method: string; label: string; amount: number }[];
}

const initialFilters: PaymentFilters = {
  search: '',
  status: 'all',
  method: 'all',
  gateway: 'all',
  dateFilter: 'last_30_days',
  customDateFrom: '',
  customDateTo: '',
};

async function fetchPayments(filters: PaymentFilters): Promise<Payment[]> {
  try {
    return await paymentsApi.list({
      status: filters.status === 'all' ? undefined : filters.status,
      method: filters.method === 'all' ? undefined : filters.method,
      gateway: filters.gateway === 'all' ? undefined : filters.gateway,
      search: filters.search || undefined,
      page: 1,
      limit: 100,
    });
  } catch (e) {
    console.error('Failed to fetch payments:', e);
    return [];
  }
}

/**
 * Derive COD records from the real payment list. The backend payment list does
 * not yet expose a per-payment collection status, so every COD order is treated
 * as awaiting collection (pending) until collection data is wired up.
 */
function toCodRecords(payments: Payment[]): CodRecord[] {
  return payments
    .filter((p) => p.paymentMethod === 'cod')
    .map((p) => ({
      id: p.id,
      orderId: p.orderId,
      customerName: p.customerName,
      customerPhone: p.customerPhone,
      amount: p.amount,
      collectionStatus: 'pending' as CodCollectionStatus,
      collectedBy: '',
      collectionTime: null,
      remarks: '',
      orderDate: p.transactionTime,
    }));
}

function toFailedPayments(payments: Payment[]): FailedPayment[] {
  return payments
    .filter((p) => p.paymentStatus === 'failed')
    .map((p) => ({
      id: p.id,
      paymentId: p.paymentId,
      orderId: p.orderId,
      customerName: p.customerName,
      customerPhone: p.customerPhone,
      amount: p.amount,
      failureReason: 'Payment failed',
      paymentMethod: p.paymentMethod,
      retryStatus: 'not_retried' as const,
      transactionTime: p.transactionTime,
    }));
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  codRecords: [],
  failedPayments: [],
  filters: { ...initialFilters },
  loading: false,
  error: null,
  drawerOpen: false,
  selectedPayment: null,

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  clearFilters: () => set({ filters: { ...initialFilters } }),

  openPaymentDrawer: (payment) => set({ drawerOpen: true, selectedPayment: payment }),

  closePaymentDrawer: () => set({ drawerOpen: false, selectedPayment: null }),

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const payments = await fetchPayments(get().filters);
      set({
        payments,
        codRecords: toCodRecords(payments),
        failedPayments: toFailedPayments(payments),
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Failed to load payments' });
    }
  },

  getFilteredPayments: () => {
    const { payments, filters } = get();
    let filtered = [...payments];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.paymentId.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.customerPhone.includes(q)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((p) => p.paymentStatus === filters.status);
    }

    if (filters.method !== 'all') {
      filtered = filtered.filter((p) => p.paymentMethod === filters.method);
    }

    if (filters.gateway !== 'all') {
      filtered = filtered.filter((p) => p.gateway === filters.gateway);
    }

    return filtered;
  },

  getPaymentById: (id: string) => {
    const { payments } = get();
    return payments.find((p) => p.id === id || p.paymentId === id);
  },

  getStats: () => {
    const { payments } = get();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const todayPayments = payments.filter((p) => p.transactionTime >= todayTs && p.paymentStatus === 'paid');
    const allPaid = payments.filter((p) => p.paymentStatus === 'paid');

    return {
      todayRevenue: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      onlinePayments: allPaid.filter((p) => p.paymentMethod !== 'cod').reduce((sum, p) => sum + p.amount, 0),
      cashOnDelivery: allPaid.filter((p) => p.paymentMethod === 'cod').reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: payments.filter((p) => p.paymentStatus === 'pending').reduce((sum, p) => sum + p.amount, 0),
      failedPayments: payments.filter((p) => p.paymentStatus === 'failed').reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: payments.filter((p) => p.paymentStatus === 'refunded').reduce((sum, p) => sum + p.amount, 0),
      averageOrderValue: allPaid.length > 0 ? Math.round(allPaid.reduce((sum, p) => sum + p.amount, 0) / allPaid.length) : 0,
      totalTransactions: payments.length,
    };
  },

  getCodStats: () => {
    const { codRecords } = get();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const todayCod = codRecords.filter((r) => r.orderDate >= todayTs);
    const collected = todayCod.filter((r) => r.collectionStatus === 'collected');
    const pending = todayCod.filter((r) => r.collectionStatus === 'pending');

    return {
      codOrdersToday: todayCod.length,
      codPendingCollection: pending.reduce((sum, r) => sum + r.amount, 0),
      codCollected: collected.reduce((sum, r) => sum + r.amount, 0),
      outstandingCod: pending.reduce((sum, r) => sum + r.amount, 0),
    };
  },

  getFilteredCodRecords: () => {
    const { codRecords } = get();
    return codRecords;
  },

  getFailedPaymentsList: () => {
    const { failedPayments } = get();
    return failedPayments;
  },

  getRevenueTrend: () => {
    const { payments } = get();
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayStart = startOfToday.getTime();

    // Build a rolling 30-day series ending today.
    const buckets: { label: string; online: number; cod: number; total: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = todayStart - i * dayMs;
      const d = new Date(dayStart);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      buckets.push({ label, online: 0, cod: 0, total: 0 });
      const bucket = buckets[buckets.length - 1];
      for (const p of payments) {
        if (p.transactionTime >= dayStart && p.transactionTime < dayStart + dayMs) {
          const amt = p.amount;
          bucket.total += amt;
          if (p.paymentMethod === 'cod') bucket.cod += amt;
          else bucket.online += amt;
        }
      }
    }
    return buckets;
  },

  getMethodDistribution: () => {
    const { payments } = get();
    const totals: Record<string, number> = {};
    for (const p of payments) {
      const method: PaymentMethodType = p.paymentMethod;
      const amt = p.paymentStatus === 'paid' || p.paymentStatus === 'refunded' ? p.amount : 0;
      totals[method] = (totals[method] || 0) + amt;
    }
    return Object.entries(totals).map(([method, amount]) => ({
      method,
      label: PAYMENT_METHOD_CONFIG[method as PaymentMethodType]?.label || method,
      amount,
    }));
  },
}));
