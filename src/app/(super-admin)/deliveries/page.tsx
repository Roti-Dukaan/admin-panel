"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage";

export default function DeliveriesPage() {
  const [branchId, setBranchId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track one-time deliveries across branches." />

      <div className="px-6 pt-4 pb-6">
        <DeliveryListPage
          branchId={branchId}
          onBranchChange={setBranchId}
          showBranchFilter
        />
      </div>
    </div>
  );
}
