"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Truck, Package, History } from "lucide-react";
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage";
import { DispatchDashboardBoard } from "@/features/dispatch/components/DispatchDashboardBoard";
import { DispatchHistoryTab } from "@/features/dispatch/components/DispatchHistoryTab";

const TAB_ITEMS = [
  { value: "deliveries", label: "All Deliveries", icon: Truck },
  { value: "dispatch", label: "Dispatch", icon: Package },
  { value: "history", label: "Dispatch History", icon: History },
] as const;

export default function DeliveriesPage() {
  const [tab, setTab] = useState("deliveries");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track and manage all deliveries and dispatch" />

      <div className="p-6 space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <TabsList className="flex w-full gap-1 bg-transparent p-0">
              {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div>
            <TabsContent value="deliveries"><DeliveryListPage /></TabsContent>
            <TabsContent value="dispatch"><DispatchDashboardBoard /></TabsContent>
            <TabsContent value="history"><DispatchHistoryTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
