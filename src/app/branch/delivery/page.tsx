"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { RealtimeDispatchPanel } from "@/features/realtime-dispatch/components/RealtimeDispatchPanel";
import { CodReconciliationPanel } from "@/features/realtime-dispatch/components/CodReconciliationPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DeliveryTab = "dispatch" | "cod";

export default function BranchDeliveryPage() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("dispatch");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track and manage deliveries for your branch." />
      <div className="px-6 pt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DeliveryTab)}>
          <TabsList>
            <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
            <TabsTrigger value="cod">COD Reconciliation</TabsTrigger>
          </TabsList>
          <TabsContent value="dispatch" className="mt-3 pb-4">
            <RealtimeDispatchPanel />
          </TabsContent>
          <TabsContent value="cod" className="mt-3 pb-4">
            <CodReconciliationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
