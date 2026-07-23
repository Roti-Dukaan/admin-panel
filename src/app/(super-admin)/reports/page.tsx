"use client";

import { motion } from "motion/react";
import { Header } from "@/components/layout/header";
import { DateFilter } from "@/features/reports/components/DateFilter";
import { StatsCards } from "@/features/reports/components/StatsCards";
import { RevenueChart } from "@/features/reports/components/RevenueChart";
import { OrdersChart } from "@/features/reports/components/OrdersChart";
import { MenuPerformance } from "@/features/reports/components/MenuPerformance";
import { SubscriptionInsights } from "@/features/reports/components/SubscriptionInsights";
import { DeliveryAnalytics } from "@/features/reports/components/DeliveryAnalytics";
import { PaymentAnalytics } from "@/features/reports/components/PaymentAnalytics";
import { CustomerInsights } from "@/features/reports/components/CustomerInsights";
import { BestSellingItems } from "@/features/reports/components/BestSellingItems";
import { RecentActivity } from "@/features/reports/components/RecentActivity";
import { useReportsStore } from "@/features/reports/hooks/useReports";
import { RefreshCw, Download, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  const loading = useReportsStore((s) => s.loading);
  const refreshData = useReportsStore((s) => s.refreshData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="space-y-6">
          <div className="h-12 w-64 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-2 h-[400px] animate-pulse rounded-xl bg-gray-200" />
            <div className="h-[400px] animate-pulse rounded-xl bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-[350px] animate-pulse rounded-xl bg-gray-200" />
            <div className="h-[350px] animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Reports & Analytics"
        subtitle="Track business performance with real-time insights."
        dateFilter={<DateFilter />}
        actions={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Download PDF
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">Soon</span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">Soon</span>
            </button>
            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <StatsCards />

        {/* Revenue + Orders Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <OrdersChart />
          </div>
        </div>

        {/* Menu + Subscription Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MenuPerformance />
          <SubscriptionInsights />
        </div>

        {/* Delivery + Payment Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DeliveryAnalytics />
          <PaymentAnalytics />
        </div>

        {/* Customer + Best Selling + Activity Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CustomerInsights />
          <BestSellingItems />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
