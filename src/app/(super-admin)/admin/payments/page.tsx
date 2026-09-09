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
import { PaymentDrawer } from "@/features/payments/components/PaymentDrawer";
import { todayDateKey } from "@/lib/date";
import { usePaymentStore } from "@/features/payments/hooks/usePayments";
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from "@/features/payments/types/payment";
import { toast } from "sonner";

type TabKey = "transactions" | "cod" | "failed" | "analytics";

const TABS: { key: TabKey; label: string; icon: React.ElementType; count?: number }[] = [
  { key: "transactions", label: "All Transactions", icon: Receipt },
  { key: "cod", label: "Cash on Delivery", icon: Banknote },
  { key: "failed", label: "Failed Payments", icon: XCircle },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("transactions");
  const refresh = usePaymentStore((s) => s.refresh);
  const loading = usePaymentStore((s) => s.loading);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleExportCSV = () => {
    const state = usePaymentStore.getState();
    const filters = state.filters;

    let rows: Record<string, string>[] = [];
    let headers: string[] = [];

    if (activeTab === "cod") {
      const records = state.getFilteredCodRecords();
      headers = ["Order ID", "Customer", "Phone", "Amount", "Collection Status", "Order Date"];
      rows = records.map((r) => ({
        "Order ID": r.orderId,
        "Customer": r.customerName,
        "Phone": r.customerPhone,
        "Amount": r.amount.toString(),
        "Collection Status": r.collectionStatus,
        "Order Date": new Date(r.orderDate).toLocaleString("en-IN"),
      }));
    } else if (activeTab === "failed") {
      const records = state.getFailedPaymentsList();
      headers = ["Payment ID", "Order ID", "Customer", "Phone", "Amount", "Failure Reason", "Method", "Transaction Time"];
      rows = records.map((r) => ({
        "Payment ID": r.paymentId,
        "Order ID": r.orderId,
        "Customer": r.customerName,
        "Phone": r.customerPhone,
        "Amount": r.amount.toString(),
        "Failure Reason": r.failureReason,
        "Method": PAYMENT_METHOD_CONFIG[r.paymentMethod]?.label || r.paymentMethod,
        "Transaction Time": new Date(r.transactionTime).toLocaleString("en-IN"),
      }));
    } else {
      const payments = state.getFilteredPayments();
      headers = ["Payment ID", "ID", "Order ID", "Customer", "Phone", "Amount", "Method", "Status", "Gateway", "Transaction Time"];
      rows = payments.map((p) => ({
        "Payment ID": p.paymentId,
        "ID": p.id,
        "Order ID": p.orderId,
        "Customer": p.customerName,
        "Phone": p.customerPhone,
        "Amount": p.amount.toString(),
        "Method": PAYMENT_METHOD_CONFIG[p.paymentMethod]?.label || p.paymentMethod,
        "Status": PAYMENT_STATUS_CONFIG[p.paymentStatus]?.label || p.paymentStatus,
        "Gateway": p.gateway,
        "Transaction Time": new Date(p.transactionTime).toLocaleString("en-IN"),
      }));
    }

    if (rows.length === 0) {
      toast.error("No data to export for the current filters");
      return;
    }

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escape).join(","),
      ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = todayDateKey();
    link.href = url;
    link.download = `payments-${activeTab}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} record${rows.length === 1 ? "" : "s"} to CSV`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        <div className="space-y-6">
            {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PaymentsHeader
            onExportCSV={handleExportCSV}
            loading={loading}
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
      <PaymentDrawer />
    </div>
  );
}
