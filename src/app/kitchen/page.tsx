"use client";

import { KitchenBoard } from "@/features/kitchen/components/KitchenBoard";
import { KitchenOperationsCard } from "@/features/kitchen-operations/KitchenOperationsCard";
import { Header } from "@/components/layout/header";

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Kitchen"
        subtitle="Live order preparation board and kitchen operations"
      />
      <div className="p-6 space-y-6">
        <KitchenOperationsCard />
        <KitchenBoard />
      </div>
    </div>
  );
}
