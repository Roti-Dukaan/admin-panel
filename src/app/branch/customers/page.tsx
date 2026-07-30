"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Header } from "@/components/layout/header"
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/DateRangeFilter"
import { CustomersStats } from "@/features/customers/components/CustomersStats"
import { CustomersFilters } from "@/features/customers/components/CustomersFilters"
import { CustomersTable } from "@/features/customers/components/CustomersTable"
import { CustomerProfile } from "@/features/customers/components/CustomerProfile"
import { useCustomerStore } from "@/features/customers/hooks/useCustomers"
import type { CustomerDatePreset } from "@/features/customers/types/customer"
import { Download } from "lucide-react"
import { useWorkspace } from "@/contexts/WorkspaceContext"

export default function BranchCustomersPage() {
  const filters = useCustomerStore((s) => s.filters)
  const setDateRange = useCustomerStore((s) => s.setDateRange)
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers)
  const { branchId } = useWorkspace()

  const dateRangeValue: DateRangeValue = {
    preset: filters.datePreset === "all" ? "today" : filters.datePreset as DateRangeValue["preset"],
    startDate: filters.customStartDate,
    endDate: filters.customEndDate,
  }

  const handleDateRangeChange = (value: DateRangeValue) => {
    setDateRange(
      value.preset as CustomerDatePreset,
      value.startDate || "",
      value.endDate || ""
    )
  }

  React.useEffect(() => {
    if (branchId) {
      fetchCustomers()
    }
  }, [branchId, fetchCustomers])

  if (!branchId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Branch context not loaded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Branch Customers"
        subtitle="View and manage customer profiles for your branch."
        dateFilter={<DateRangeFilter value={dateRangeValue} onChange={handleDateRangeChange} />}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <CustomersStats />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CustomersFilters />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <CustomersTable />
        </motion.div>
      </div>

      {/* Customer Profile Drawer */}
      <CustomerProfile />
    </div>
  )
}