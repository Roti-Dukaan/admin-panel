"use client"

import { useState, useEffect, useCallback } from "react"
import { branchesApi, type Branch, type CreateBranchDTO, type UpdateBranchDTO, type BranchStatus, type LatLngPoint } from "@/lib/api/master-data/branches.api"
import { citiesApi, type City } from "@/lib/api/master-data/cities.api"
import { areasApi, type Area } from "@/lib/api/master-data/areas.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Store, Plus, Search, Loader2, AlertCircle, MapPin } from "lucide-react"
import { BranchAddressSearch, type PlaceResult } from "@/components/Map/BranchAddressSearch"
import dynamic from "next/dynamic"
import DeliverySettingsDialog from "./branches/DeliverySettingsDialog"
import { toast } from "sonner"
import { DEFAULT_MAP_CENTER, findOverlappingBranch, hasValidMapCoords, parseDeliveryPolygon, toMapCoords } from "@/lib/geo-utils"
import { reverseGeocode, loadGoogleMaps } from "@/lib/google-maps"
import { locationService } from "@/services/location.service"
import { normalizeEmail } from "@/lib/utils/email"

const DeliveryPolygonPicker = dynamic(
  () => import("@/components/Map/DeliveryPolygonPicker").then((m) => m.DeliveryPolygonPicker),
  { ssr: false }
)

const ITEMS_PER_PAGE = 20

const STATUS_CONFIG: Record<BranchStatus, { variant: "success" | "warning" | "destructive" | "info" | "secondary"; label: string }> = {
  OPEN: { variant: "success", label: "Open" },
  BUSY: { variant: "warning", label: "Busy" },
  CLOSED: { variant: "destructive", label: "Closed" },
  MAINTENANCE: { variant: "secondary", label: "Maintenance" },
}

const STATUS_OPTIONS: BranchStatus[] = ["OPEN", "BUSY", "CLOSED", "MAINTENANCE"]

interface BranchFormData {
  name: string
  code: string
  phone: string
  managerName: string
  managerEmail: string
  address: string
  formattedAddress: string
  placeId: string
  cityId: string
  areaId: string
  pincode: string
  deliveryPolygon: LatLngPoint[]
  status: BranchStatus
  isActive: boolean
}

const EMPTY_FORM: BranchFormData = {
  name: "", code: "", phone: "", managerName: "", managerEmail: "",
  address: "", formattedAddress: "", placeId: "",
  cityId: "", areaId: "", pincode: "",
  deliveryPolygon: [],
  status: "OPEN", isActive: true,
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState<BranchFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [togglingBranchId, setTogglingBranchId] = useState<string | null>(null)
  const [deliverySettingsBranch, setDeliverySettingsBranch] = useState<Branch | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, unknown> = { search, page, limit: ITEMS_PER_PAGE }
      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      const response = await branchesApi.list(params)
      setBranches(response.data.data.items)
      setTotal(response.data.data.total)
    } catch (err) {
      setError("Failed to load branches")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  const fetchCities = useCallback(async () => {
    try {
      const response = await citiesApi.getAllActive()
      setCities(response.data.data)
    } catch (err) { console.error("Failed to load cities", err) }
  }, [])

  const fetchAreas = useCallback(async (cityId?: string) => {
    if (!cityId) { setAreas([]); return }
    try {
      const response = await areasApi.getByCityId(cityId)
      setAreas(response.data.data)
    } catch (err) { console.error("Failed to load areas", err) }
  }, [])

  useEffect(() => { fetchCities() }, [fetchCities])
  useEffect(() => { fetchBranches() }, [fetchBranches])

  useEffect(() => {
    if (form.cityId) fetchAreas(form.cityId)
  }, [form.cityId, fetchAreas])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingBranch(null)
    setAreas([])
    setMapCoords(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch)
    const manager = branch.branchManager || branch.admins?.[0]
    setForm({
      name: branch.name,
      code: branch.code,
      phone: branch.phone || "",
      managerName: manager?.name || "",
      managerEmail: manager?.email || "",
      address: branch.address || "",
      formattedAddress: branch.formattedAddress || "",
      placeId: branch.placeId || "",
      cityId: branch.cityId,
      areaId: branch.areaId,
      pincode: branch.pincode || "",
      deliveryPolygon: parseDeliveryPolygon(branch.deliveryPolygon),
      status: branch.status,
      isActive: branch.isActive,
    })
    setMapCoords(toMapCoords(branch.latitude, branch.longitude))
    if (branch.cityId) fetchAreas(branch.cityId)
    setDialogOpen(true)
  }

  const handlePlaceSelected = (place: PlaceResult) => {
    setMapCoords(toMapCoords(place.latitude, place.longitude))

    setForm((prev) => ({
      ...prev,
      formattedAddress: place.formattedAddress || prev.formattedAddress,
      placeId: place.placeId || prev.placeId,
    }))

    if (place.city) {
      const matchedCity = cities.find(
        (c) => c.name.toLowerCase() === place.city.toLowerCase()
      )
      if (matchedCity) {
        setForm((prev) => ({ ...prev, cityId: matchedCity.id }))
        fetchAreas(matchedCity.id)

        if (place.area) {
          setTimeout(() => {
            setAreas((currentAreas) => {
              const matchedArea = currentAreas.find(
                (a) => a.name.toLowerCase() === place.area.toLowerCase()
              )
              if (matchedArea) {
                setForm((prev) => ({ ...prev, areaId: matchedArea.id }))
              }
              return currentAreas
            })
          }, 300)
        }
      }
    }
  }

  const handleUseCurrentLocation = async () => {
    setIsLocating(true)
    try {
      const position = await locationService.getCurrentPosition()
      const { latitude, longitude } = position.coords

      await loadGoogleMaps()

      try {
        const place = await reverseGeocode(latitude, longitude)
        handlePlaceSelected({
          latitude,
          longitude,
          formattedAddress: place.formattedAddress,
          placeId: place.placeId,
          city: place.city,
          area: place.area,
        })
        toast.success("Current location applied")
      } catch {
        handlePlaceSelected({
          latitude,
          longitude,
          formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          placeId: "",
          city: "",
          area: "",
        })
        toast.warning("Location detected but address lookup failed")
      }
    } catch (err: unknown) {
      const geoErr = err as GeolocationPositionError
      if (geoErr.code === 1) {
        toast.error(
          "Location permission denied. Click the lock icon in your browser address bar and allow location access for this site.",
        )
      } else if (geoErr.code === 2) {
        toast.error("Unable to detect your location. Please ensure GPS is enabled.")
      } else if (geoErr.code === 3) {
        toast.error("Location request timed out. Please try again.")
      } else {
        toast.error(geoErr.message || "Failed to get current location")
      }
    } finally {
      setIsLocating(false)
    }
  }

  const handleSave = async () => {
    if (form.deliveryPolygon.length < 3) {
      toast.error("Draw a delivery polygon with at least 3 points on the map")
      return
    }

    if (!mapCoords) {
      toast.error("Pin the branch location on the map before saving")
      return
    }

    const hasManagerEmail = !!form.managerEmail.trim()
    const hasManagerName = !!form.managerName.trim()
    if (hasManagerEmail !== hasManagerName) {
      toast.error("Please provide both Manager Name and Branch Manager Email")
      return
    }

    setSaving(true)
    try {
      const allBranchesResponse = await branchesApi.list({ isActive: true, limit: 200 })
      const overlap = findOverlappingBranch(
        form.deliveryPolygon,
        allBranchesResponse.data.data.items,
        editingBranch?.id,
      )
      if (overlap) {
        toast.error(
          `Delivery polygon overlaps with branch "${overlap.name}" (${overlap.code}). Adjust the zone before saving.`,
        )
        return
      }

      const payload: CreateBranchDTO | UpdateBranchDTO = {
        name: form.name,
        code: form.code,
        phone: form.phone || undefined,
        address: form.address || undefined,
        formattedAddress: form.formattedAddress || undefined,
        placeId: form.placeId || undefined,
        pincode: form.pincode || undefined,
        latitude: mapCoords?.lat,
        longitude: mapCoords?.lng,
        cityId: form.cityId,
        areaId: form.areaId,
        deliveryPolygon: form.deliveryPolygon,
        status: form.status,
        isActive: form.isActive,
      }

      if (editingBranch) {
        const updatePayload: UpdateBranchDTO = {
          ...payload,
          managerName: form.managerName.trim() || undefined,
          managerEmail: form.managerEmail ? normalizeEmail(form.managerEmail) : undefined,
        }
        const response = await branchesApi.update(editingBranch.id, updatePayload)
        const managerAccess = response.data.data.managerAccess
        if (managerAccess?.action === "invited") {
          toast.success("Branch updated. New manager invitation sent by email.")
        } else if (managerAccess?.action === "assigned") {
          toast.success("Branch updated. Manager access granted to existing account.")
        } else if (managerAccess?.action === "updated") {
          toast.success("Branch updated. Manager details saved.")
        } else {
          toast.success("Branch updated successfully")
        }
      } else {
        const createPayload: CreateBranchDTO = {
          ...payload,
          managerName: form.managerName.trim() || undefined,
          managerEmail: form.managerEmail ? normalizeEmail(form.managerEmail) : undefined,
        }
        const response = await branchesApi.create(createPayload)
        const managerAccess = response.data.data.managerAccess
        if (managerAccess?.action === "invited") {
          toast.success("Branch created. Manager invitation sent by email.")
        } else if (managerAccess?.action === "assigned") {
          toast.success("Branch created. Manager access granted to existing account.")
        } else {
          toast.success("Branch created successfully")
        }
      }
      setDialogOpen(false)
      resetForm()
      fetchBranches()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to save branch"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (branch: Branch, isActive: boolean) => {
    setTogglingBranchId(branch.id)
    try {
      await branchesApi.update(branch.id, {
        name: branch.name,
        code: branch.code,
        isActive,
      })
      setBranches((prev) =>
        prev.map((item) => (item.id === branch.id ? { ...item, isActive } : item)),
      )
      toast.success(isActive ? "Branch activated" : "Branch deactivated")
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update branch status"
      toast.error(message)
    } finally {
      setTogglingBranchId(null)
    }
  }

  const getCityName = (cityId: string) => cities.find(c => c.id === cityId)?.name || cityId
  const getAreaName = (areaId: string, branch: Branch) => branch.area?.name || areas.find(a => a.id === areaId)?.name || areaId
  const getManagerName = (branch: Branch) =>
    branch.branchManager?.name ||
    branch.branchManager?.email ||
    (branch.admins && branch.admins.length > 0 ? branch.admins[0].name || branch.admins[0].email : "—")

  const mapCenter = mapCoords ?? DEFAULT_MAP_CENTER
  const hasBranchLocation = mapCoords !== null && hasValidMapCoords(mapCoords.lat, mapCoords.lng)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-sm text-gray-500 mt-1">Manage branch locations and operations</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search branches..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => { setStatusFilter(value); setPage(1) }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchBranches}>Retry</Button>
            </div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Store className="h-8 w-8 mb-2" />
              <p>No branches found</p>
              {(search || (statusFilter && statusFilter !== "all")) && <p className="text-sm">Try adjusting your filters</p>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                      <th className="pb-3 pr-4">Branch Name</th>
                      <th className="pb-3 pr-4">City</th>
                      <th className="pb-3 pr-4">Area</th>
                      <th className="pb-3 pr-4">Manager</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr
                        key={branch.id}
                        className={`border-b border-gray-100 text-sm hover:bg-gray-50 ${branch.isActive ? "" : "opacity-60"}`}
                      >
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-gray-900">{branch.name}</p>
                            <p className="text-xs text-gray-400">{branch.code}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{getCityName(branch.cityId)}</td>
                        <td className="py-3 pr-4 text-gray-600">{getAreaName(branch.areaId, branch)}</td>
                        <td className="py-3 pr-4 text-gray-600">{getManagerName(branch)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_CONFIG[branch.status].variant}>
                            {STATUS_CONFIG[branch.status].label}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(branch)}>Edit</Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => setDeliverySettingsBranch(branch)}
                            >
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              Delivery
                            </Button>
                            <div className="flex items-center gap-2 pl-1">
                              <Switch
                                checked={branch.isActive}
                                disabled={togglingBranchId === branch.id}
                                onCheckedChange={(checked) => handleToggleActive(branch, checked)}
                                aria-label={`${branch.isActive ? "Deactivate" : "Activate"} ${branch.name}`}
                              />
                              <span className="text-xs text-gray-500 min-w-[24px]">
                                {branch.isActive ? "On" : "Off"}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="h-4 w-4 text-orange-500" />
                Kitchen Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Hyderabad Main Kitchen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., HYD-MAIN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escalation phone
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+919876543210"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Voice call ~1 min after an unaccepted order. Saved here and synced to the branch manager.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                  <Input
                    value={form.managerName}
                    onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                    placeholder="e.g., Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Manager Email</label>
                  <Input
                    type="email"
                    value={form.managerEmail}
                    onChange={(e) => setForm({ ...form, managerEmail: normalizeEmail(e.target.value) })}
                    placeholder="manager@rotidukaan.com"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {editingBranch
                      ? "Changing the email will reassign manager access or send a new invitation"
                      : "An invitation email will be sent to set up branch manager access"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Branch Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Branch Address
                  </label>
                  <BranchAddressSearch
                    onPlaceSelected={handlePlaceSelected}
                    defaultValue={form.formattedAddress || form.address}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Search by address, landmark, business name, road, area, or place
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="text-sm"
                >
                  {isLocating ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Use Current Location
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <Input
                      value={form.formattedAddress}
                      onChange={(e) => setForm({ ...form, formattedAddress: e.target.value })}
                      placeholder="Full branch address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <Input
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      placeholder="Enter pincode"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <Select
                      value={form.cityId}
                      onValueChange={(value) => setForm({ ...form, cityId: value, areaId: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                    <Select
                      value={form.areaId}
                      onValueChange={(value) => setForm({ ...form, areaId: value })}
                      disabled={!form.cityId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={form.cityId ? "Select area" : "Select city first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Service Area</h3>
              <p className="text-sm text-gray-500 mb-4">
                Draw the delivery zone on the map below. Customers inside this polygon can order from this kitchen.
              </p>
              {editingBranch?.deliveryRadiusKm && form.deliveryPolygon.length === 0 && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  This branch currently uses a legacy {editingBranch.deliveryRadiusKm} km radius. Draw a polygon to replace it.
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Coverage Map</h3>
              {!hasBranchLocation && (
                <p className="mb-3 text-xs text-gray-500">
                  Search an address or use current location to pin the kitchen. Map starts at Hyderabad until a location is selected.
                </p>
              )}
              <DeliveryPolygonPicker
                latitude={mapCenter.lat}
                longitude={mapCenter.lng}
                value={form.deliveryPolygon}
                onChange={(deliveryPolygon) => setForm((prev) => ({ ...prev, deliveryPolygon }))}
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Kitchen Status</h3>
              <div className="flex items-center gap-6">
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(value: BranchStatus) => setForm({ ...form, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((key) => (
                        <SelectItem key={key} value={key}>{STATUS_CONFIG[key].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.code || !form.cityId || !form.areaId || form.deliveryPolygon.length < 3}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBranch ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeliverySettingsDialog
        branch={deliverySettingsBranch!}
        open={!!deliverySettingsBranch}
        onOpenChange={(open) => { if (!open) setDeliverySettingsBranch(null) }}
      />
    </div>
  )
}
