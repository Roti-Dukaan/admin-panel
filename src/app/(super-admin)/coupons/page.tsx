"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Ticket } from "lucide-react";
import { Header } from "@/components/layout/header";
import { useCouponStore } from "@/features/coupons/hooks/useCoupons";
import { CouponsTable } from "@/features/coupons/components/CouponsTable";
import { CouponEditor } from "@/features/coupons/components/CouponEditor";
import { branchesApi } from "@/lib/api/master-data/branches.api";

export default function CouponsPage() {
  const coupons = useCouponStore((s) => s.coupons);
  const loading = useCouponStore((s) => s.loading);
  const loadCoupons = useCouponStore((s) => s.loadCoupons);
  const searchQuery = useCouponStore((s) => s.searchQuery);
  const setSearchQuery = useCouponStore((s) => s.setSearchQuery);
  const statusFilter = useCouponStore((s) => s.statusFilter);
  const setStatusFilter = useCouponStore((s) => s.setStatusFilter);
  const editorOpen = useCouponStore((s) => s.editorOpen);
  const editorMode = useCouponStore((s) => s.editorMode);
  const selectedCoupon = useCouponStore((s) => s.selectedCoupon);
  const openCreateEditor = useCouponStore((s) => s.openCreateEditor);
  const openEditEditor = useCouponStore((s) => s.openEditEditor);
  const closeEditor = useCouponStore((s) => s.closeEditor);
  const createCoupon = useCouponStore((s) => s.createCoupon);
  const updateCoupon = useCouponStore((s) => s.updateCoupon);
  const toggleActive = useCouponStore((s) => s.toggleActive);
  const getFilteredCoupons = useCouponStore((s) => s.getFilteredCoupons);

  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadCoupons();
    branchesApi
      .list({ limit: 100 })
      .then((res) => {
        const items = res.data?.data?.items ?? [];
        setBranches(items.map((b) => ({ id: b.id, name: b.name })));
      })
      .catch(() => setBranches([]));
  }, [loadCoupons]);

  const filtered = getFilteredCoupons();
  const branchNameById = useMemo(
    () => Object.fromEntries(branches.map((b) => [b.id, b.name])),
    [branches],
  );

  const stats = useMemo(
    () => ({
      total: coupons.length,
      active: coupons.filter((c) => c.active).length,
      used: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    }),
    [coupons],
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Realtime Order Coupons"
        subtitle="Manage discount codes for one-time cart checkout only."
        actions={
          <>
            <button
              onClick={() => loadCoupons()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={openCreateEditor}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Total Coupons", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Total Redemptions", value: stats.used },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Ticket className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code or title..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <CouponsTable
          coupons={filtered}
          branchNameById={branchNameById}
          onEdit={openEditEditor}
          onToggleActive={toggleActive}
        />
      </div>

      <CouponEditor
        open={editorOpen}
        mode={editorMode}
        coupon={selectedCoupon}
        branches={branches}
        onClose={closeEditor}
        onSave={async (input) => {
          if (editorMode === "create") {
            await createCoupon(input);
          } else if (selectedCoupon) {
            await updateCoupon(selectedCoupon.id, input);
          }
        }}
      />
    </div>
  );
}
