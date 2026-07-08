"use client";

import { Search, X, Filter } from "lucide-react";
import { useCustomerStore } from "../hooks/useCustomers";
import { CustomerFilters as CustomerFiltersType } from "../types/customer";

export function CustomersFilters() {
  const filters = useCustomerStore((s) => s.filters);
  const setSearch = useCustomerStore((s) => s.setSearch);
  const setSubscriptionFilter = useCustomerStore((s) => s.setSubscriptionFilter);
  const setStatusFilter = useCustomerStore((s) => s.setStatusFilter);
  const setPincodeFilter = useCustomerStore((s) => s.setPincodeFilter);
  const setPaymentPreferenceFilter = useCustomerStore((s) => s.setPaymentPreferenceFilter);
  const clearFilters = useCustomerStore((s) => s.clearFilters);

  const hasFilters =
    filters.subscription !== "all" ||
    filters.status !== "all" ||
    filters.pincode !== "" ||
    filters.paymentPreference !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or pincode..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Subscription Filter */}
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
          {(["all", "subscribed", "not-subscribed"] as const).map((val) => {
            const labels = { all: "All", subscribed: "Subscribed", "not-subscribed": "Not Subscribed" };
            const active = filters.subscription === val;
            return (
              <button
                key={val}
                onClick={() => setSubscriptionFilter(val)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labels[val]}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
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

        {/* Payment Preference Filter */}
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
          {(["all", "online", "cod"] as const).map((val) => {
            const labels = { all: "All Payments", online: "Online", cod: "COD" };
            const active = filters.paymentPreference === val;
            return (
              <button
                key={val}
                onClick={() => setPaymentPreferenceFilter(val)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labels[val]}
              </button>
            );
          })}
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
