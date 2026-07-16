"use client";

import { KitchenBoard } from "@/features/kitchen/components/KitchenBoard";
import { Header } from "@/components/layout/header";

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Kitchen"
        subtitle="Live order preparation board and kitchen operations"
      />
      <KitchenBoard />
    </div>
  );
}
