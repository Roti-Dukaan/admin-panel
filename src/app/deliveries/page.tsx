"use client";

import { Header } from "@/components/layout/header";
import { DeliveryListPage } from "@/features/delivery/components/DeliveryListPage";

export default function DeliveriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Deliveries"
        subtitle="Track and manage all deliveries"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DeliveryListPage />
      </div>
    </div>
  );
}