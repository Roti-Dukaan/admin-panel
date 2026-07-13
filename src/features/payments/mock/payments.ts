import type { Payment, PaymentStatus, PaymentMethodType, CodRecord, FailedPayment } from '../types/payment';

const now = Date.now();

export const mockPayments: Payment[] = [];

export const mockCodRecords: CodRecord[] = [] as CodRecord[];

export const mockFailedPayments: FailedPayment[] = [] as FailedPayment[];

export const mockPaymentsToday = 0;
export const mockPaymentsYesterday = 0;
export const mockPaymentsThisWeek = 0;
export const mockPaymentsThisMonth = 0;

export function generateRevenueTrendData(): { label: string; online: number; cod: number; total: number }[] {
  return [];
}

export function generatePaymentMethodDistribution(): { method: string; label: string; amount: number }[] {
  return [];
}