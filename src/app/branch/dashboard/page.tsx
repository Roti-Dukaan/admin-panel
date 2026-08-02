"use client"

import { Header } from "@/components/layout/header"
import { BranchDashboardPage } from "@/features/branch-dashboard/components/BranchDashboardPage"
import { useBranchName } from "@/features/branch/hooks/useBranchName"

export default function BranchDashboardPageWrapper() {
  const branchName = useBranchName()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title={branchName ? `${branchName} Dashboard` : "Dashboard"}
        subtitle={
          branchName
            ? `Overview and key metrics for ${branchName}.`
            : "Branch overview and key metrics."
        }
        showSearch={false}
        actions={null}
      />
      <BranchDashboardPage />
    </div>
  )
}