"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage";
import { BranchSubscriptionDeliveriesTab } from "@/features/delivery/components/BranchSubscriptionDeliveriesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DeliveryTab = "orders" | "subscriptions";

export default function BranchDeliveryPage() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("orders");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track and manage deliveries for your branch." />
      <div className="px-6 pt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DeliveryTab)}>
          <TabsList>
            <TabsTrigger value="orders">One-time Orders</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-4">
            <DeliveryListPage apiMode="branch" />
          </TabsContent>
          <TabsContent value="subscriptions" className="mt-4 pb-6">
            <BranchSubscriptionDeliveriesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
