"use client"

import { Header } from "@/components/layout/header"
import KitchenProductionPage from "@/features/kitchen/production/KitchenProductionPage"

export default function BranchProductionPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Production"
        subtitle="Production planning for your branch."
        showSearch={false}
        actions={null}
      />
      <KitchenProductionPage />
    </div>
  )
}