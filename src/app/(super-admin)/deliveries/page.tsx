"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage";
import { BranchSubscriptionDeliveriesTab } from "@/features/delivery/components/BranchSubscriptionDeliveriesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DeliveryTab = "orders" | "subscriptions";

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("orders");
  const [branchId, setBranchId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track and manage all deliveries" />

      <div className="px-6 pt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DeliveryTab)}>
          <TabsList>
            <TabsTrigger value="orders">One-time Orders</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-4">
            <DeliveryListPage
              branchId={branchId}
              onBranchChange={setBranchId}
              showBranchFilter
            />
          </TabsContent>
          <TabsContent value="subscriptions" className="mt-4 pb-6">
            <BranchSubscriptionDeliveriesTab
              apiMode="admin"
              branchId={branchId}
              onBranchChange={setBranchId}
              showBranchFilter
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
