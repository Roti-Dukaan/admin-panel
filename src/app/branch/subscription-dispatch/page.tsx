"use client";

import { Header } from "@/components/layout/header";
import { SubscriptionDispatchBoard } from "@/features/kitchen-subscriptions/components/SubscriptionDispatchBoard";

export default function BranchSubscriptionDispatchPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        titleNode={
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Subscription Dispatch</h1>
            <p className="text-sm text-gray-500">
              Assign packed subscription deliveries to delivery staff
            </p>
          </div>
        }
        showSearch={false}
      />
      <SubscriptionDispatchBoard />
    </div>
  );
}
