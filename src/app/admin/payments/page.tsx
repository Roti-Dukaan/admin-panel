"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Receipt, Banknote, XCircle, BarChart3 } from "lucide-react";
import { PaymentsHeader } from "@/features/payments/components/PaymentsHeader";
import { PaymentsStats } from "@/features/payments/components/PaymentsStats";
import { PaymentsFilters } from "@/features/payments/components/PaymentsFilters";
import { PaymentsTable } from "@/features/payments/components/PaymentsTable";
import { RevenueChart } from "@/features/payments/components/RevenueChart";
import { PaymentMethodChart } from "@/features/payments/components/PaymentMethodChart";
import { CodDashboard } from "@/features/payments/components/CodDashboard";
import { CodTable } from "@/features/payments/components/CodTable";
import { FailedPayments } from "@/features/payments/components/FailedPayments";
import { ExportDialog } from "@/features/payments/components/ExportDialog";
import { usePaymentStore } from "@/features/payments/hooks/usePayments";

type TabKey = "transactions" | "cod" | "failed" | "analytics";

const TABS: { key: TabKey; label: string; icon: React.ElementType; count?: number }[] = [
  { key: "transactions", label: "All Transactions", icon: Receipt },
  { key: "cod", label: "Cash on Delivery", icon: Banknote },
  { key: "failed", label: "Failed Payments", icon: XCircle },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("transactions");
  const [exportDialog, setExportDialog] = useState<{ open: boolean; format: 'csv' | 'excel' }>({ open: false, format: 'csv' });
  const refresh = usePaymentStore((s) => s.refresh);
  const loading = usePaymentStore((s) => s.loading);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          </div>
        )}
        <div className="space-y-6">
            {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PaymentsHeader
            onExportCSV={() => setExportDialog({ open: true, format: 'csv' })}
            onExportExcel={() => setExportDialog({ open: true, format: 'excel' })}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <PaymentsStats />
        </motion.div>

        {/* Subtabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <PaymentsFilters />
              <PaymentsTable />
            </motion.div>
          )}

          {activeTab === "cod" && (
            <motion.div
              key="cod"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <CodDashboard />
              <CodTable />
            </motion.div>
          )}

          {activeTab === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <FailedPayments />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart />
                <PaymentMethodChart />
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
    </div>

    {/* Export Dialog */}
      <ExportDialog
        open={exportDialog.open}
        onClose={() => setExportDialog({ ...exportDialog, open: false })}
        format={exportDialog.format}
      />
    </div>
  );
}
