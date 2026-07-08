"use client";

import { motion } from "motion/react";
import { CustomersHeader } from "@/features/customers/components/CustomersHeader";
import { CustomersStats } from "@/features/customers/components/CustomersStats";
import { CustomersFilters } from "@/features/customers/components/CustomersFilters";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { CustomerProfile } from "@/features/customers/components/CustomerProfile";

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CustomersHeader />
        </motion.div>

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
  );
}
