"use client";

import { Header } from "@/components/layout/header";
import { DeliveryBoysSection } from "@/features/delivery-boys/components/DeliveryBoysSection";

export default function BranchDeliveryPartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Delivery Partners"
        subtitle="Subscription delivery staff for your branch."
        showSearch={false}
        actions={null}
      />
      <div className="p-6 max-w-4xl">
        <DeliveryBoysSection />
      </div>
    </div>
  );
}
