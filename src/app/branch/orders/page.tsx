"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { OrderDrawer } from "@/features/orders/components/OrderDrawer"
import { useBranchOrdersRealtime } from "@/features/orders/hooks/useBranchOrdersRealtime"
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage"
import { BranchSubscriptionDeliveriesTab } from "@/features/delivery/components/BranchSubscriptionDeliveriesTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkspace } from "@/contexts/WorkspaceContext"

type BranchOrderTab = "one-time" | "subscriptions"

export default function BranchOrdersPage() {
  const { branchId } = useWorkspace()
  useBranchOrdersRealtime()

  const [activeTab, setActiveTab] = React.useState<BranchOrderTab>("one-time")

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
        title="Branch Orders"
        subtitle="Manage one-time and subscription orders for your branch."
        showSearch={false}
      />

      <div className="px-6 pt-4 pb-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as BranchOrderTab)}
        >
          <TabsList>
            <TabsTrigger value="one-time">One-time Orders</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="mt-4">
            <DeliveryListPage apiMode="branch" />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            <BranchSubscriptionDeliveriesTab />
          </TabsContent>
        </Tabs>
      </div>

      <OrderDrawer />
    </div>
  )
}
