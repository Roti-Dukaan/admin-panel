"use client";

import { Search, X } from "lucide-react";
import { useCustomerStore } from "../hooks/useCustomers";
import { DeliveryBranchFilter } from "@/features/delivery/components/DeliveryBranchFilter";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function CustomersFilters() {
  const filters = useCustomerStore((s) => s.filters);
  const setSearch = useCustomerStore((s) => s.setSearch);
  const setStatusFilter = useCustomerStore((s) => s.setStatusFilter);
  const setBranchFilter = useCustomerStore((s) => s.setBranchFilter);
  const clearFilters = useCustomerStore((s) => s.clearFilters);
  const { isSuperAdmin } = useWorkspace();

  const hasFilters =
    filters.status !== "all" ||
    filters.search !== "" ||
    filters.datePreset !== "all" ||
    (isSuperAdmin && filters.branchId !== "all");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
          {(["all", "active", "inactive"] as const).map((val) => {
            const labels = { all: "All", active: "Active", inactive: "Inactive" };
            const active = filters.status === val;
            return (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labels[val]}
              </button>
            );
          })}
        </div>

        {isSuperAdmin && (
          <DeliveryBranchFilter
            value={filters.branchId === "all" ? undefined : filters.branchId}
            onChange={(branchId) => setBranchFilter(branchId ?? "all")}
            className="w-[200px] h-10 rounded-xl border-gray-200 bg-white"
          />
        )}

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
