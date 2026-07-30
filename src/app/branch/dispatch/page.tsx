"use client";

import { Header } from "@/components/layout/header";
import { DispatchDashboardBoard } from "@/features/dispatch/components/DispatchDashboardBoard";

export default function BranchDispatchDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        titleNode={
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dispatch Management</h1>
            <p className="text-sm text-gray-500">Track and manage delivery dispatches</p>
          </div>
        }
        showSearch={false}
        actions={null}
      />
      <DispatchDashboardBoard />
    </div>
  );
}
