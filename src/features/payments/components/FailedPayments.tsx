"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Phone, RefreshCw, XCircle } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";
import { PAYMENT_METHOD_CONFIG } from "../types/payment";
import { toast } from "sonner";

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function FailedPayments() {
  const getFailedPaymentsList = usePaymentStore((s) => s.getFailedPaymentsList);
  const failed = useMemo(() => getFailedPaymentsList(), [getFailedPaymentsList]);

  if (failed.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">Failed Payments ({failed.length})</h4>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Customer</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Order</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Failure Reason</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Method</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Retry</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {failed.map((fp) => (
              <tr key={fp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{fp.customerName}</p>
                    <p className="text-xs text-gray-500">{fp.customerPhone}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-900">{fp.orderId}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{fp.amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-xs text-red-600">{fp.failureReason}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{PAYMENT_METHOD_CONFIG[fp.paymentMethod]?.label || fp.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    fp.retryStatus === 'retry_succeeded'
                      ? 'bg-emerald-50 text-emerald-700'
                      : fp.retryStatus === 'retried'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {fp.retryStatus === 'retry_succeeded' ? 'Succeeded' : fp.retryStatus === 'retried' ? 'Retried' : 'Not Retried'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toast.info("Contact customer feature coming soon")}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
