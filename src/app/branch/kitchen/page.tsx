"use client"

import { Header } from "@/components/layout/header"
import { KitchenBoard } from "@/features/kitchen/components/KitchenBoard"

export default function BranchKitchenPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Kitchen"
        subtitle="Live kitchen orders for your branch."
        showSearch={false}
        actions={null}
      />
      <KitchenBoard />
    </div>
  )
}