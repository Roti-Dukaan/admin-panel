"use client"

import { Header } from "@/components/layout/header"
import { BranchTeamSection } from "@/features/branch-team/components/BranchTeamSection"

export default function BranchTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Team"
        subtitle="Manage branch managers for your location."
        showSearch={false}
        actions={null}
      />
      <div className="p-6 max-w-3xl">
        <BranchTeamSection />
      </div>
    </div>
  )
}
