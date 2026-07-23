"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Download,
  RefreshCw,
  CreditCard,
  CheckCircle,
  FileEdit,
  Star,
  CalendarDays,
  CalendarRange,
  Search,
} from "lucide-react";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";
import { Header } from "@/components/layout/header";
import { PlansTable } from "@/features/subscription-plans/components/PlansTable";
import { PlanEditor } from "@/features/subscription-plans/components/PlanEditor";
import { DeleteConfirmation } from "@/features/subscription-plans/components/DeleteConfirmation";

const statCards = [
  { key: "total", label: "Total Plans", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "active", label: "Active Plans", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "draft", label: "Draft Plans", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "featured", label: "Featured Plans", icon: Star, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "weekly", label: "Weekly Plans", icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "monthly", label: "Monthly Plans", icon: CalendarRange, color: "text-rose-600", bg: "bg-rose-50" },
];

export default function SubscriptionPlansPage() {
  const plans = useSubscriptionPlanStore((s) => s.plans);
  const loadPlans = useSubscriptionPlanStore((s) => s.loadPlans);
  const stats = useMemo(() => ({
    total: plans.length,
    active: plans.filter((p) => p.status === "published").length,
    draft: plans.filter((p) => p.status === "draft").length,
    featured: plans.filter((p) => p.isFeatured).length,
    weekly: plans.filter((p) => p.delivery.deliveryDays.length >= 5).length,
    monthly: plans.filter((p) => p.pricing.monthlyPrice > 0).length,
  }), [plans]);
  const searchQuery = useSubscriptionPlanStore((s) => s.searchQuery);
  const setSearchQuery = useSubscriptionPlanStore((s) => s.setSearchQuery);
  const statusFilter = useSubscriptionPlanStore((s) => s.statusFilter);
  const setStatusFilter = useSubscriptionPlanStore((s) => s.setStatusFilter);
  const openCreateEditor = useSubscriptionPlanStore((s) => s.openCreateEditor);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Plans"
        subtitle="Create and manage recurring meal plans."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
              <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">
                Soon
              </span>
            </button>
            <button
              onClick={() => loadPlans()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={openCreateEditor}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const value = stats[card.key as keyof typeof stats];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plans..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "published", "draft", "archived"] as const).map((status) => {
                const labels = { all: "All", published: "Active", draft: "Draft", archived: "Archived" };
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      statusFilter === status
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <PlansTable />
        </motion.div>
      </div>

      {/* Plan Editor */}
      <PlanEditor />

      {/* Delete Confirmation */}
      <DeleteConfirmation />
    </div>
  );
}
