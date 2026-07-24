"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { branchesApi, type Branch, type CreateBranchDTO, type UpdateBranchDTO, type BranchStatus } from "@/lib/api/master-data/branches.api"
import { citiesApi, type City } from "@/lib/api/master-data/cities.api"
import { areasApi, type Area } from "@/lib/api/master-data/areas.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

const DeliveryRadiusPreview = dynamic(
  () => import("@/components/Map/DeliveryRadiusPreview").then((m) => m.DeliveryRadiusPreview),
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
  email: string
  address: string
  formattedAddress: string
  placeId: string
  cityId: string
  areaId: string
  pincode: string
  deliveryRadiusKm: number
  status: BranchStatus
  isActive: boolean
}

const EMPTY_FORM: BranchFormData = {
  name: "", code: "", phone: "", email: "",
  address: "", formattedAddress: "", placeId: "",
  cityId: "", areaId: "", pincode: "",
  deliveryRadiusKm: 5,
  status: "OPEN", isActive: true,
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState<BranchFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null)
  const [deliverySettingsBranch, setDeliverySettingsBranch] = useState<Branch | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { search, page, limit: ITEMS_PER_PAGE }
      if (statusFilter) params.status = statusFilter
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
    setForm({
      name: branch.name,
      code: branch.code,
      phone: branch.phone || "",
      email: branch.email || "",
      address: branch.address || "",
      formattedAddress: branch.formattedAddress || "",
      placeId: branch.placeId || "",
      cityId: branch.cityId,
      areaId: branch.areaId,
      pincode: branch.pincode || "",
      deliveryRadiusKm: branch.deliveryRadiusKm || 5,
      status: branch.status,
      isActive: branch.isActive,
    })
    setMapCoords({ lat: branch.latitude, lng: branch.longitude })
    if (branch.cityId) fetchAreas(branch.cityId)
    setDialogOpen(true)
  }

  const handlePlaceSelected = (place: PlaceResult) => {
    setMapCoords({ lat: place.latitude, lng: place.longitude })

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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setMapCoords({ lat: latitude, lng: longitude })

        try {
          if (window.google?.maps?.Geocoder) {
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === "OK" && results?.length) {
                  const place = results[0]
                  let city = "", area = ""
                  for (const comp of place.address_components) {
                    const types = comp.types
                    if (types.includes("locality")) city = comp.long_name
                    else if (types.includes("sublocality") || types.includes("sublocality_level_1")) area = comp.long_name
                    else if (types.includes("postal_code")) pincode = comp.long_name
                    else if (!city && types.includes("administrative_area_level_2")) city = comp.long_name
                    else if (!area && types.includes("neighborhood")) area = comp.long_name
                  }

                  setForm((prev) => ({
                    ...prev,
                    formattedAddress: place.formatted_address,
                    address: place.formatted_address,
                  }))

                  if (city) {
                    const matchedCity = cities.find(
                      (c) => c.name.toLowerCase() === city.toLowerCase()
                    )
                    if (matchedCity) {
                      setForm((prev) => ({ ...prev, cityId: matchedCity.id }))
                      fetchAreas(matchedCity.id)
                      if (area) {
                        setTimeout(() => {
                          setAreas((current) => {
                            const matchedArea = current.find(
                              (a) => a.name.toLowerCase() === area.toLowerCase()
                            )
                            if (matchedArea) {
                              setForm((prev) => ({ ...prev, areaId: matchedArea.id }))
                            }
                            return current
                          })
                        }, 300)
                      }
                    }
                  }
                }
                setIsLocating(false)
              }
            )
          } else {
            setIsLocating(false)
            toast.success("Location detected from browser GPS")
          }
        } catch {
          setIsLocating(false)
          toast.success("Location detected from browser GPS")
        }
      },
      (err) => {
        setIsLocating(false)
        toast.error("Failed to get current location: " + err.message)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: CreateBranchDTO | UpdateBranchDTO = {
        name: form.name,
        code: form.code,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        formattedAddress: form.formattedAddress || undefined,
        placeId: form.placeId || undefined,
        pincode: form.pincode || undefined,
        cityId: form.cityId,
        areaId: form.areaId,
        deliveryRadiusKm: form.deliveryRadiusKm,
        status: form.status,
        isActive: form.isActive,
      }

      if (editingBranch) {
        await branchesApi.update(editingBranch.id, payload)
        toast.success("Branch updated successfully")
      } else {
        await branchesApi.create(payload)
        toast.success("Branch created successfully")
      }
      setDialogOpen(false)
      resetForm()
      fetchBranches()
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save branch"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingBranch) return
    setSaving(true)
    try {
      await branchesApi.archive(deletingBranch.id)
      toast.success("Branch archived successfully")
      setDeleteDialogOpen(false)
      setDeletingBranch(null)
      fetchBranches()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive branch")
    } finally {
      setSaving(false)
    }
  }

  const getCityName = (cityId: string) => cities.find(c => c.id === cityId)?.name || cityId
  const getAreaName = (areaId: string) => areas.find(a => a.id === areaId)?.name || areaId
  const getManagerName = (branch: Branch) =>
    branch.admins && branch.admins.length > 0 ? branch.admins[0].name || branch.admins[0].email : "—"

  const showMap = mapCoords !== null

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
                <SelectItem value="">All Status</SelectItem>
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
              {(search || statusFilter) && <p className="text-sm">Try adjusting your filters</p>}
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
                      <tr key={branch.id} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-gray-900">{branch.name}</p>
                            <p className="text-xs text-gray-400">{branch.code}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{getCityName(branch.cityId)}</td>
                        <td className="py-3 pr-4 text-gray-600">{branch.area?.name || getAreaName(branch.areaId)}</td>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => { setDeletingBranch(branch); setDeleteDialogOpen(true) }}
                            >
                              Archive
                            </Button>
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

      {/* Create/Edit Branch Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Section 1: Kitchen Information */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., HYD-MAIN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+919876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="kitchen@rotidukaan.com"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Branch Location */}
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
                      placeholder="Auto-populated from search"
                      readOnly
                      className="bg-gray-50 text-gray-600"
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

            {/* Section 3: Service Area */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Service Area</h3>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Radius
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    step={1}
                    value={form.deliveryRadiusKm}
                    onChange={(e) => setForm({ ...form, deliveryRadiusKm: Math.min(25, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    KM
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Customers inside this radius will be able to place orders from this kitchen.
                </p>
              </div>
            </div>

            {/* Section 4: Coverage Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Coverage Preview</h3>
              {showMap && mapCoords ? (
                <DeliveryRadiusPreview
                  latitude={mapCoords.lat}
                  longitude={mapCoords.lng}
                  radius={form.deliveryRadiusKm}
                  name={form.name || 'Kitchen'}
                  className=""
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-center text-gray-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Select an address to see the map preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Kitchen Status */}
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
              disabled={saving || !form.name || !form.code || !form.cityId || !form.areaId || !form.formattedAddress}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBranch ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Branch</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to archive {deletingBranch?.name}? This action can be reversed by reactivating.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Archive
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
