import { create } from 'zustand';
import type { Payment, PaymentFilters, CodRecord, FailedPayment, PaymentStatus, PaymentMethodType } from '../types/payment';
import { mockPayments, mockCodRecords, mockFailedPayments } from '../mock/payments';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

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

  setFilters: (filters: Partial<PaymentFilters>) => void;
  clearFilters: () => void;
  refresh: () => void;

  getFilteredPayments: () => Payment[];
  getPaymentById: (id: string) => Payment | undefined;
  getStats: () => PaymentStats;
  getCodStats: () => CodStats;
  getFilteredCodRecords: () => CodRecord[];
  getFailedPaymentsList: () => FailedPayment[];
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

function isInDateRange(timestamp: number, filter: PaymentFilters): boolean {
  if (filter.dateFilter === 'custom') {
    if (!filter.customDateFrom || !filter.customDateTo) return true;
    const from = new Date(filter.customDateFrom).getTime();
    const to = new Date(filter.customDateTo).getTime() + day;
    return timestamp >= from && timestamp <= to;
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayStart = startOfDay.getTime();

  switch (filter.dateFilter) {
    case 'today':
      return timestamp >= todayStart;
    case 'yesterday':
      return timestamp >= todayStart - day && timestamp < todayStart;
    case 'last_7_days':
      return timestamp >= todayStart - 7 * day;
    case 'last_30_days':
    default:
      return true;
  }
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: mockPayments,
  codRecords: mockCodRecords,
  failedPayments: mockFailedPayments,
  filters: { ...initialFilters },
  loading: false,

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  clearFilters: () => set({ filters: { ...initialFilters } }),

  refresh: () => {
    set({ loading: true });
    setTimeout(() => set({ loading: false }), 500);
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

    filtered = filtered.filter((p) => isInDateRange(p.transactionTime, filters));

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
}));
