"use client"

import { useState, useEffect } from "react"
import {
  branchesApi,
  type Branch,
  type DeliverySettings,
  type UpdateDeliverySettingsDTO,
  type LatLngPoint,
} from "@/lib/api/master-data/branches.api"
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin, X } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { findOverlappingBranch, parseDeliveryPolygon, toMapCoords, DEFAULT_MAP_CENTER } from "@/lib/geo-utils"

const DeliveryPolygonPicker = dynamic(
  () => import("@/components/Map/DeliveryPolygonPicker").then((m) => m.DeliveryPolygonPicker),
  { ssr: false }
)

interface DeliverySettingsSidebarProps {
  branch: Branch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeliverySettingsSidebar({
  branch,
  open,
  onOpenChange,
}: DeliverySettingsSidebarProps) {
  const roles = useAdminAuthStore((s) => s.user?.roles ?? [])
  const canEdit = roles.includes("ADMIN") || roles.includes("OWNER")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [form, setForm] = useState<UpdateDeliverySettingsDTO>({})
  const [deliveryPolygon, setDeliveryPolygon] = useState<LatLngPoint[]>([])
  const mapCenter = settings
    ? toMapCoords(settings.latitude, settings.longitude)
    : null

  useEffect(() => {
    if (!open || !branch) return
    setLoading(true)
    branchesApi
      .getDeliverySettings(branch.id)
      .then((res) => {
        const data = res.data.data
        setSettings(data)
        setForm({
          allowScheduledOrders: data.allowScheduledOrders,
          allowSubscriptions: data.allowSubscriptions,
        })
        setDeliveryPolygon(parseDeliveryPolygon(data.deliveryPolygon))
      })
      .catch(() => toast.error("Failed to load delivery settings"))
      .finally(() => setLoading(false))
  }, [open, branch?.id])

  const handleSave = async () => {
    if (!branch) return
    if (deliveryPolygon.length < 3) {
      toast.error("Draw a delivery polygon with at least 3 points")
      return
    }

    setSaving(true)
    try {
      const allBranchesResponse = await branchesApi.list({ isActive: true, limit: 200 })
      const overlap = findOverlappingBranch(
        deliveryPolygon,
        allBranchesResponse.data.data.items,
        branch.id,
      )
      if (overlap) {
        toast.error(
          `Delivery polygon overlaps with branch "${overlap.name}" (${overlap.code}). Adjust the zone before saving.`,
        )
        return
      }

      await branchesApi.updateDeliverySettings(branch.id, {
        ...form,
        deliveryPolygon,
      })
      toast.success("Delivery settings updated successfully")
      onOpenChange(false)
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update delivery settings"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-full border-l border-gray-200 bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "60vw", maxWidth: "900px" }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Delivery Settings — {branch?.name ?? "..."}
              </h2>
              <p className="text-sm text-gray-500">
                {canEdit ? "Configure delivery polygon" : "View delivery configuration (read-only)"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : !settings ? (
            <div className="text-center py-12 text-gray-500">
              <p>Unable to load delivery settings</p>
            </div>
          ) : (
            <div className="space-y-6">
              {settings.deliveryRadiusKm && deliveryPolygon.length === 0 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  This branch currently uses a legacy {settings.deliveryRadiusKm} km radius. Draw a polygon below to replace it.
                </p>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Delivery Service Area
                </Label>
                <DeliveryPolygonPicker
                  latitude={mapCenter?.lat ?? DEFAULT_MAP_CENTER.lat}
                  longitude={mapCenter?.lng ?? DEFAULT_MAP_CENTER.lng}
                  value={deliveryPolygon}
                  onChange={setDeliveryPolygon}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowScheduledOrders ?? settings.allowScheduledOrders ?? false}
                      onChange={(e) => setForm({ ...form, allowScheduledOrders: e.target.checked })}
                      disabled={!canEdit}
                      className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Scheduled Orders</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowSubscriptions ?? settings.allowSubscriptions ?? false}
                      onChange={(e) => setForm({ ...form, allowSubscriptions: e.target.checked })}
                      disabled={!canEdit}
                      className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Subscriptions</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loading || deliveryPolygon.length < 3}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
