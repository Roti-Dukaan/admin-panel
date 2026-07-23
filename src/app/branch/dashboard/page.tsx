"use client"

import { Header } from "@/components/layout/header"
import { BranchDashboardPage } from "@/features/branch-dashboard/components/BranchDashboardPage"

export default function BranchDashboardPageWrapper() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Dashboard"
        subtitle="Branch overview and key metrics."
        showSearch={false}
        actions={null}
      />
      <BranchDashboardPage />
    </div>
  )
}