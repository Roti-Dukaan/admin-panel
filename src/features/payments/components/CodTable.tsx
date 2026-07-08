"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { usePaymentStore } from "../hooks/usePayments";
import { COD_COLLECTION_STATUS_CONFIG } from "../types/payment";

function formatDateTime(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function CodTable() {
  const getFilteredCodRecords = usePaymentStore((s) => s.getFilteredCodRecords);
  const records = useMemo(() => getFilteredCodRecords(), [getFilteredCodRecords]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-900">COD Records</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Order ID</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Customer</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Collected By</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Collection Time</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const cfg = COD_COLLECTION_STATUS_CONFIG[record.collectionStatus];
              return (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-900">{record.orderId}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{record.customerName}</p>
                      <p className="text-xs text-gray-500">{record.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{record.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color} ${cfg.bgColor}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{record.collectedBy || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDateTime(record.collectionTime)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{record.remarks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
