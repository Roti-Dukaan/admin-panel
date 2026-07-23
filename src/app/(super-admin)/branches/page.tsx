"use client"

import { useState, useEffect, useCallback } from "react"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Store, Plus, Search, Loader2, AlertCircle, MapPin } from "lucide-react"
import DeliverySettingsDialog from "./branches/DeliverySettingsDialog"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 20

const STATUS_CONFIG: Record<BranchStatus, { variant: "success" | "warning" | "destructive" | "info" | "secondary"; label: string }> = {
  OPEN: { variant: "success", label: "Open" },
  BUSY: { variant: "warning", label: "Busy" },
  CLOSED: { variant: "destructive", label: "Closed" },
  MAINTENANCE: { variant: "secondary", label: "Maintenance" },
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
  const [formData, setFormData] = useState<CreateBranchDTO>({
    name: "", code: "", cityId: "", areaId: "",
    latitude: 17.4933, longitude: 78.3916,
    phone: "", email: "", address: "",
    status: "OPEN", isActive: true,
  })
  const [saving, setSaving] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null)
  const [deliverySettingsBranch, setDeliverySettingsBranch] = useState<Branch | null>(null)

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
    if (formData.cityId) fetchAreas(formData.cityId)
  }, [formData.cityId, fetchAreas])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const resetForm = () => {
    setFormData({
      name: "", code: "", cityId: "", areaId: "",
      latitude: 17.4933, longitude: 78.3916,
      phone: "", email: "", address: "",
      status: "OPEN", isActive: true,
    })
    setEditingBranch(null)
    setAreas([])
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      cityId: branch.cityId,
      areaId: branch.areaId,
      latitude: branch.latitude,
      longitude: branch.longitude,
      phone: branch.phone || "",
      email: branch.email || "",
      address: branch.address || "",
      status: branch.status,
      isActive: branch.isActive,
    })
    if (branch.cityId) fetchAreas(branch.cityId)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingBranch) {
        await branchesApi.update(editingBranch.id, formData)
        toast.success("Branch updated successfully")
      } else {
        await branchesApi.create(formData)
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription>
              {editingBranch ? "Update branch details" : "Create a new branch location"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hyderabad Main Kitchen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., HYD-MAIN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+919876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="kitchen@rotidukaan.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="HITEC City, Hyderabad, Telangana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Select
                value={formData.cityId}
                onValueChange={(value) => setFormData({ ...formData, cityId: value, areaId: "" })}
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
                value={formData.areaId}
                onValueChange={(value) => setFormData({ ...formData, areaId: value })}
                disabled={!formData.cityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.cityId ? "Select area" : "Select city first"} />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: BranchStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.code || !formData.cityId || !formData.areaId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBranch ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {deletingBranch?.name}? This action can be reversed by reactivating.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Archive
            </Button>
          </DialogFooter>
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
