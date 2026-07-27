"use client";

import { Header } from "@/components/layout/header";
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage";

export default function DeliveriesPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Deliveries" subtitle="Track and manage all deliveries" />

      <div className="p-6">
        <DeliveryListPage />
      </div>
    </div>
  );
}
