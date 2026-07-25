"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAdminAvailability, useAdminBranchAvailability } from "@/features/branch-menu-availability/hooks/useBranchMenuAvailability";
import { AvailabilityTable } from "@/features/branch-menu-availability/components/AvailabilityTable";
import { SummaryCards } from "@/features/branch-menu-availability/components/SummaryCards";
import { branchMenuAvailabilityApi } from "@/lib/api/branch-menu-availability.api";
import { Search, Filter, AlertTriangle, ArrowLeft, Store, ChevronRight } from "lucide-react";
import type { BranchMenuAvailabilityItem, BranchMenuSummary } from "@/lib/api/branch-menu-availability.api";
import type { AvailabilityStatus } from "@/features/branch-menu-availability/types/branch-menu-availability";

export default function AdminBranchMenuAvailabilityPage() {
  const [selectedBranch, setSelectedBranch] = useState<BranchMenuSummary | null>(null);
  const { summaries, loading: summariesLoading, refresh: refreshSummaries } = useAdminAvailability();
  const { items, loading, filters, setFilters, refresh } = useAdminBranchAvailability(selectedBranch?.branchId ?? "");
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (item: BranchMenuAvailabilityItem, newStatus: AvailabilityStatus) => {
    setUpdating(item.id);
    try {
      await branchMenuAvailabilityApi.adminUpdate(item.branchId, item.foodItemId, { status: newStatus });
      refresh();
      refreshSummaries();
    } catch {
      // handled
    } finally {
      setUpdating(null);
    }
  };

  const selectedSummary = summaries.find((s) => s.branchId === selectedBranch?.branchId);
  const totalIssues = (selectedSummary?.outOfStock ?? 0) + (selectedSummary?.disabled ?? 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Branch Menu Availability"
        subtitle={selectedBranch ? `Managing ${selectedBranch.branchName}` : "Select a branch to manage item availability"}
        actions={
          <button
            onClick={selectedBranch ? () => { setSelectedBranch(null); } : refreshSummaries}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {selectedBranch ? (
              <>
                <ArrowLeft className="h-4 w-4" />
                All Branches
              </>
            ) : (
              "Refresh"
            )}
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Branch List View */}
        {!selectedBranch && (
          <>
            {summariesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : summaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Store className="h-12 w-12 mb-3" />
                <p className="text-sm">No branches found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {summaries.map((s) => {
                  const issues = s.outOfStock + s.disabled;
                  return (
                    <button
                      key={s.branchId}
                      onClick={() => setSelectedBranch(s)}
                      className="group rounded-xl border border-gray-100 bg-white p-5 text-left transition-all hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-orange-50 p-2">
                            <Store className="h-4 w-4 text-orange-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm">{s.branchName}</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
                      </div>

                      {issues > 0 && (
                        <div className="mb-3 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          <AlertTriangle className="h-3 w-3" />
                          {issues} {issues === 1 ? "issue" : "issues"}
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <p className="text-base font-bold text-blue-600">{s.totalItems}</p>
                          <p className="text-blue-500">Total</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2">
                          <p className="text-base font-bold text-emerald-600">{s.available}</p>
                          <p className="text-emerald-500">Avail</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-2">
                          <p className="text-base font-bold text-red-600">{s.outOfStock}</p>
                          <p className="text-red-500">OOS</p>
                        </div>
                        <div className="rounded-lg bg-gray-100 p-2">
                          <p className="text-base font-bold text-gray-600">{s.disabled}</p>
                          <p className="text-gray-500">Off</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Branch Detail View */}
        {selectedBranch && (
          <>
            {selectedSummary && <SummaryCards summary={selectedSummary} />}

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search ?? ""}
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

            <AvailabilityTable items={items} loading={loading} onStatusChange={handleStatusChange} />

            {!loading && items.length > 0 && (
              <p className="text-xs text-gray-400 text-center">
                Showing {items.length} {totalIssues > 0 ? "filtered" : ""} records
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
