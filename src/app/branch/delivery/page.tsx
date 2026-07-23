"use client"

import { Header } from "@/components/layout/header"
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage"

export default function BranchDeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track and manage deliveries for your branch." />
      <DeliveryListPage />
    </div>
  )
}