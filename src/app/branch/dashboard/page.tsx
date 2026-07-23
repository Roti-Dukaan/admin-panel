'use client';

import * as React from 'react';

export default function BranchDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Today's Orders</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">₹50,000</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Active Tickets</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">5</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Kitchen Status</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">OPEN</p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        This is a placeholder view for the Branch Management System.
        In production, this will show real branch metrics and analytics.
      </p>
    </div>
  )
}