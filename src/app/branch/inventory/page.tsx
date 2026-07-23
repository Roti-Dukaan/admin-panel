"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { useManagerAvailability } from "@/features/branch-menu-availability/hooks/useBranchMenuAvailability"
import { SummaryCards } from "@/features/branch-menu-availability/components/SummaryCards"
import { AvailabilityTable } from "@/features/branch-menu-availability/components/AvailabilityTable"
import { branchMenuAvailabilityApi } from "@/lib/api/branch-menu-availability.api"
import { RefreshCw, Search } from "lucide-react"
import type { BranchMenuAvailabilityItem } from "@/lib/api/branch-menu-availability.api"
import type { AvailabilityStatus } from "@/features/branch-menu-availability/types/branch-menu-availability"
import { useWorkspace } from "@/contexts/WorkspaceContext"

export default function BranchInventoryPage() {
  const { branchId } = useWorkspace()
  const { items, summary, loading, refresh } = useManagerAvailability()
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const handleStatusChange = async (item: BranchMenuAvailabilityItem, newStatus: AvailabilityStatus) => {
    setUpdating(item.id)
    try {
      await branchMenuAvailabilityApi.managerUpdate(item.foodItemId, { status: newStatus })
      refresh()
    } catch {
      // handled
    } finally {
      setUpdating(null)
    }
  }

  const filteredItems = search
    ? items.filter((i) => i.foodItem?.name?.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Inventory & Availability"
        subtitle={summary?.branchName ? `Manage menu availability for ${summary.branchName}` : "Manage your branch menu availability"}
        actions={
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {summary && <SummaryCards summary={summary} />}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Branch Manager — Availability Only</p>
          <p className="mt-1 text-amber-700">
            You can only change availability status (Available / Out of Stock / Disabled) for your own branch.
            To edit prices, descriptions, or other item details, contact a Super Admin.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <AvailabilityTable
          items={filteredItems}
          loading={loading}
          onStatusChange={handleStatusChange}
          updatingId={updating}
        />
      </div>
    </div>
  )
}