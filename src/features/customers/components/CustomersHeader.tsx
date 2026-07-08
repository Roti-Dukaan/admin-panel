"use client";

import { Download, Users } from "lucide-react";
import { useCustomerStore } from "../hooks/useCustomers";

export function CustomersHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage all customer profiles, subscriptions and orders.</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}
