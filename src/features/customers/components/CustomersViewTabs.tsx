"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerStore } from "../hooks/useCustomers";
import type { CustomerViewType } from "../types/customer";

export function CustomersViewTabs() {
  const viewType = useCustomerStore((s) => s.filters.viewType);
  const setViewType = useCustomerStore((s) => s.setViewType);

  return (
    <Tabs
      value={viewType}
      onValueChange={(value) => setViewType(value as CustomerViewType)}
    >
      <TabsList>
        <TabsTrigger value="all">All Customers</TabsTrigger>
        <TabsTrigger value="subscription">Subscription Customers</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
