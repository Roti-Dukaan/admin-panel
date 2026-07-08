"use client";

import { motion } from "motion/react";
import { ReportsHeader } from "@/features/reports/components/ReportsHeader";
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

export default function ReportsPage() {
  const loading = useReportsStore((s) => s.loading);

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
      <div className="p-6 space-y-6">
        <ReportsHeader />
        <DateFilter />
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
