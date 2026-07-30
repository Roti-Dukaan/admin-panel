"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"
import { useWorkspace } from "@/contexts/WorkspaceContext"

export default function BranchProfilePage() {
  const { branchId, role, permissions } = useWorkspace()
  const { user } = useAdminAuthStore()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Branch Profile"
        subtitle="Your branch account and settings"
        showSearch={false}
        actions={null}
      />

      <div className="p-6 max-w-3xl">
        {/* User Info Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-gray-900 capitalize">{role?.toLowerCase().replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-900">{user?.name || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Branch ID</span>
              <span className="font-medium text-gray-900 font-mono text-sm">{branchId || "Not assigned"}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-500">Permissions</span>
              <span className="font-medium text-gray-900">{permissions?.length || 0} permissions</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Branch Team</h2>
              <p className="text-sm text-gray-500">Invite additional branch managers with the same access.</p>
            </div>
            <a
              href="/branch/team"
              className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
            >
              Manage Team
            </a>
          </div>
        </div>

        {/* Branch Settings Card */}
        <div className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Branch Operations</p>
                <p className="text-sm text-gray-500">Manage your branch-specific settings</p>
              </div>
              <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Kitchen Settings</p>
                <p className="text-sm text-gray-500">Configure kitchen display and workflows</p>
              </div>
              <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Delivery Zone</p>
                <p className="text-sm text-gray-500">Manage your delivery service area</p>
              </div>
              <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Printer Settings</p>
                <p className="text-sm text-gray-500">Configure kitchen and receipt printers</p>
              </div>
              <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}