"use client"

import * as React from "react"
import { Header } from "@/components/layout/header"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"
import { useWorkspace } from "@/contexts/WorkspaceContext"

export default function BranchProfilePage() {
  const { branchId, role, permissions } = useWorkspace()
  const { user, logout } = useAdminAuthStore()

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

        {/* Danger Zone */}
        <div className="mt-6 rounded-2xl border border-red-200/80 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}