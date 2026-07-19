"use client";

import { RefreshCw, Download, CreditCard } from "lucide-react";
import { usePaymentStore } from "../hooks/usePayments";

interface PaymentsHeaderProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  loading?: boolean;
}

export function PaymentsHeader({ onExportCSV, onExportExcel, loading = false }: PaymentsHeaderProps) {
  const refresh = usePaymentStore((s) => s.refresh);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <CreditCard className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments & Transactions</h1>
          <p className="mt-0.5 text-sm text-gray-500">Monitor online and Cash on Delivery transactions.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <button
          onClick={onExportCSV}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
      </div>
    </div>
  );
}
