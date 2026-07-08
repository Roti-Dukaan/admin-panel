"use client";

import { motion } from "motion/react";
import { Globe, CreditCard, Building2, Smartphone, Hash, Activity } from "lucide-react";
import type { Payment } from "../types/payment";

export function GatewayCard({ payment }: { payment: Payment }) {
  if (!payment.razorpayInfo) return null;
  const rp = payment.razorpayInfo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Globe className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Razorpay Information</h3>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Razorpay Order ID</p>
          <p className="text-xs font-mono font-semibold text-gray-900 mt-0.5">{rp.orderId}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Razorpay Payment ID</p>
          <p className="text-xs font-mono font-semibold text-gray-900 mt-0.5">{rp.paymentId}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[11px] font-medium text-gray-500">Gateway</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{rp.gateway}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[11px] font-medium text-gray-500">Payment Method</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5 uppercase">{rp.paymentMethod}</p>
          </div>
        </div>

        {rp.bank && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-gray-500">Bank</p>
              <p className="text-sm font-semibold text-gray-900">{rp.bank}</p>
            </div>
          </div>
        )}

        {rp.upiApp && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-gray-500">UPI App</p>
              <p className="text-sm font-semibold text-gray-900">{rp.upiApp}</p>
            </div>
          </div>
        )}

        {rp.cardNetwork && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-gray-500">Card Network</p>
              <p className="text-sm font-semibold text-gray-900">{rp.cardNetwork}</p>
            </div>
          </div>
        )}

        {rp.maskedCardNumber && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[11px] font-medium text-gray-500">Masked Card Number</p>
            <p className="text-sm font-mono font-semibold text-gray-900 mt-0.5">{rp.maskedCardNumber}</p>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <Hash className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-[11px] font-medium text-gray-500">Transaction Reference</p>
            <p className="text-xs font-mono font-semibold text-gray-900">{rp.transactionReference}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <Activity className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-[11px] font-medium text-gray-500">Webhook Status</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              rp.webhookStatus === 'processed'
                ? 'bg-emerald-50 text-emerald-700'
                : rp.webhookStatus === 'pending'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {rp.webhookStatus}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
