"use client";

import { motion } from "motion/react";
import { ArrowLeft, CreditCard, Clock, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "../hooks/usePayments";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { CustomerCard } from "./CustomerCard";
import { GatewayCard } from "./GatewayCard";
import { PaymentTimeline } from "./PaymentTimeline";
import { PAYMENT_METHOD_CONFIG } from "../types/payment";
import { toast } from "sonner";
import type { Payment } from "../types/payment";

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function PaymentInfoRow({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: { text: string; color: string; bg: string } }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.color} ${badge.bg}`}>
          {badge.text}
        </span>
      ) : (
        <span className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
      )}
    </div>
  );
}

export function PaymentDetails({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const getPaymentById = usePaymentStore((s) => s.getPaymentById);
  const payment = getPaymentById(paymentId);

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Payment not found</p>
          <button onClick={() => router.push('/admin/payments')} className="mt-3 text-sm text-orange-600 hover:underline">
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    paid: { text: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    pending: { text: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50' },
    failed: { text: 'Failed', color: 'text-red-700', bg: 'bg-red-50' },
    authorized: { text: 'Authorized', color: 'text-blue-700', bg: 'bg-blue-50' },
    refunded: { text: 'Refunded', color: 'text-violet-700', bg: 'bg-violet-50' },
    cancelled: { text: 'Cancelled', color: 'text-gray-700', bg: 'bg-gray-100' },
  }[payment.paymentStatus];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => router.push('/admin/payments')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payment Details</h1>
            <p className="mt-0.5 text-sm text-gray-500">{payment.paymentId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(payment.paymentId);
                toast.success("Payment ID copied!");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              Copy ID
            </button>
          </div>
        </motion.div>

        {/* Payment Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Payment Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-medium text-gray-500">Payment ID</p>
              <p className="text-sm font-mono font-semibold text-gray-900 mt-0.5">{payment.paymentId}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Order ID</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.orderId}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Amount</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Status</p>
              <div className="mt-1"><PaymentStatusBadge status={payment.paymentStatus} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] font-medium text-gray-500">Customer</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.customerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Payment Method</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{PAYMENT_METHOD_CONFIG[payment.paymentMethod]?.label}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Gateway</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{payment.gateway}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500">Transaction Time</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateTime(payment.transactionTime)}</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <PaymentTimeline events={payment.timeline} />

        {/* Grid: Order + Customer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderSummaryCard payment={payment} />
          <CustomerCard payment={payment} />
        </div>

        {/* Gateway Info */}
        {payment.razorpayInfo && <GatewayCard payment={payment} />}
      </div>
    </div>
  );
}
