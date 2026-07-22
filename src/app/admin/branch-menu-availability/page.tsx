"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAdminAvailability } from "@/features/branch-menu-availability/hooks/useBranchMenuAvailability";
import { AvailabilityTable } from "@/features/branch-menu-availability/components/AvailabilityTable";
import { branchMenuAvailabilityApi } from "@/lib/api/branch-menu-availability.api";
import { Search, Filter, AlertTriangle } from "lucide-react";
import type { BranchMenuAvailabilityItem } from "@/lib/api/branch-menu-availability.api";
import type { AvailabilityStatus } from "@/features/branch-menu-availability/types/branch-menu-availability";

export default function AdminBranchMenuAvailabilityPage() {
  const { items, summaries, loading, filters, setFilters, refresh } = useAdminAvailability();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (item: BranchMenuAvailabilityItem, newStatus: AvailabilityStatus) => {
    setUpdating(item.id);
    try {
      await branchMenuAvailabilityApi.adminUpdate(item.branchId, item.foodItemId, { status: newStatus });
      refresh();
    } catch {
      // handled
    } finally {
      setUpdating(null);
    }
  };

  const totalIssues = summaries.reduce((acc, s) => acc + s.outOfStock + s.disabled, 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Branch Menu Availability"
        subtitle="Super Admin — View and manage item availability across all branches"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary cards per branch */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {summaries.map((s) => (
            <div key={s.branchId} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">{s.branchName}</h3>
                {s.outOfStock + s.disabled > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    {s.outOfStock + s.disabled} issues
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                  <p className="text-lg font-bold text-emerald-600">{s.available}</p>
                  <p className="text-emerald-600">Available</p>
                </div>
                <div className="rounded-lg bg-red-50 p-2 text-center">
                  <p className="text-lg font-bold text-red-600">{s.outOfStock}</p>
                  <p className="text-red-600">OOS</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <p className="text-lg font-bold text-gray-600">{s.disabled}</p>
                  <p className="text-gray-600">Disabled</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2 text-center">
                  <p className="text-lg font-bold text-blue-600">{s.totalItems}</p>
                  <p className="text-blue-600">Total</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value || undefined }))}
              placeholder="Search by food item name..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.issuesOnly ?? false}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, issuesOnly: e.target.checked || undefined }))}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <Filter className="h-4 w-4" />
            Issues only
          </label>
        </div>

        {/* Table */}
        <AvailabilityTable
          items={items}
          loading={loading}
          showBranch
          onStatusChange={handleStatusChange}
        />

        {/* Pagination info */}
        {!loading && items.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            Showing {items.length} of {totalIssues > 0 ? 'filtered ' : ''}records
          </p>
        )}
      </div>
    </div>
  );
}
