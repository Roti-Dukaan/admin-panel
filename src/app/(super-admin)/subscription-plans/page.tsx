"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Download,
  RefreshCw,
  CreditCard,
  CheckCircle,
  CircleOff,
  CalendarDays,
  CalendarRange,
  Search,
} from "lucide-react";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";
import { Header } from "@/components/layout/header";
import { PlansTable } from "@/features/subscription-plans/components/PlansTable";
import { PlanEditor } from "@/features/subscription-plans/components/PlanEditor";
import { DeleteConfirmation } from "@/features/subscription-plans/components/DeleteConfirmation";
import { PackageEditor } from "@/features/subscription-packages/components/PackageEditor";
import { packagesApi } from "@/features/subscription-packages/services/packages.api";
import type { SubscriptionPackage } from "@/features/subscription-packages/types/subscription-package";

const statCards = [
  { key: "total", label: "Total Packages", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "active", label: "Active Packages", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "inactive", label: "Inactive Packages", icon: CircleOff, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "weekly", label: "Weekly", icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "monthly", label: "Monthly", icon: CalendarRange, color: "text-rose-600", bg: "bg-rose-50" },
] as const;

export default function SubscriptionPlansPage() {
  const plans = useSubscriptionPlanStore((s) => s.plans);
  const loading = useSubscriptionPlanStore((s) => s.loading);
  const loadPlans = useSubscriptionPlanStore((s) => s.loadPlans);
  const stats = useMemo(
    () => ({
      total: plans.length,
      active: plans.filter((p) => p.isActive).length,
      inactive: plans.filter((p) => !p.isActive).length,
      weekly: plans.filter((p) => p.type === "WEEKLY").length,
      monthly: plans.filter((p) => p.type === "MONTHLY").length,
    }),
    [plans]
  );
  const searchQuery = useSubscriptionPlanStore((s) => s.searchQuery);
  const setSearchQuery = useSubscriptionPlanStore((s) => s.setSearchQuery);
  const statusFilter = useSubscriptionPlanStore((s) => s.statusFilter);
  const setStatusFilter = useSubscriptionPlanStore((s) => s.setStatusFilter);

  const [packageEditorOpen, setPackageEditorOpen] = useState(false);
  const [packageEditorMode, setPackageEditorMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const openCreatePackage = () => {
    setSelectedPackage(null);
    setPackageEditorMode("create");
    setPackageEditorOpen(true);
  };

  const openEditPackage = async (planId: string) => {
    try {
      const pkg = await packagesApi.getById(planId);
      setSelectedPackage(pkg);
      setPackageEditorMode("edit");
      setPackageEditorOpen(true);
    } catch {
      // Packages without categories can still use legacy plan editor via table actions
    }
  };

  const openViewPackage = async (planId: string) => {
    try {
      const pkg = await packagesApi.getById(planId);
      setSelectedPackage(pkg);
      setPackageEditorMode("view");
      setPackageEditorOpen(true);
    } catch {
      const plan = plans.find((p) => p.id === planId);
      if (plan) useSubscriptionPlanStore.getState().openViewEditor(plan);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Subscription Packages"
        subtitle="Create dynamic packages with category-level pricing. No package base price — customers select categories."
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
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={openCreatePackage}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Package
            </button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const value = stats[card.key];
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
                placeholder="Search packages..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "active", "inactive"] as const).map((status) => {
                const labels = { all: "All", active: "Active", inactive: "Inactive" };
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <PlansTable onEditPackage={openEditPackage} onViewPackage={openViewPackage} />
        </motion.div>
      </div>

      <PackageEditor
        open={packageEditorOpen}
        mode={packageEditorMode}
        selected={selectedPackage}
        onClose={() => setPackageEditorOpen(false)}
        onSaved={() => loadPlans()}
      />
      <PlanEditor />
      <DeleteConfirmation />
    </div>
  );
}
