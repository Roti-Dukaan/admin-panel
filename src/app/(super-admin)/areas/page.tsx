"use client"

import { useState, useEffect, useCallback } from "react"
import { areasApi, type Area, type CreateAreaDTO, type UpdateAreaDTO } from "@/lib/api/master-data/areas.api"
import { citiesApi, type City } from "@/lib/api/master-data/cities.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { MapPin, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 20

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [formData, setFormData] = useState<CreateAreaDTO>({ name: "", cityId: "" })
  const [saving, setSaving] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingArea, setDeletingArea] = useState<Area | null>(null)

  const fetchAreas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { search, page, limit: ITEMS_PER_PAGE }
      if (cityFilter) params.cityId = cityFilter
      const response = await areasApi.list(params)
      setAreas(response.data.data.items)
      setTotal(response.data.data.total)
    } catch (err) {
      setError("Failed to load areas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, cityFilter, page])

  const fetchCities = useCallback(async () => {
    try {
      const response = await citiesApi.getAllActive()
      setCities(response.data.data)
    } catch (err) {
      console.error("Failed to load cities", err)
    }
  }, [])

  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  useEffect(() => {
    fetchAreas()
  }, [fetchAreas])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const resetForm = () => {
    setFormData({ name: "", cityId: cityFilter || "" })
    setEditingArea(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (area: Area) => {
    setEditingArea(area)
    setFormData({ name: area.name, cityId: area.cityId })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingArea) {
        await areasApi.update(editingArea.id, formData)
        toast.success("Area updated successfully")
      } else {
        await areasApi.create(formData)
        toast.success("Area created successfully")
      }
      setDialogOpen(false)
      resetForm()
      fetchAreas()
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save area"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingArea) return
    setSaving(true)
    try {
      await areasApi.archive(deletingArea.id)
      toast.success("Area archived successfully")
      setDeleteDialogOpen(false)
      setDeletingArea(null)
      fetchAreas()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive area")
    } finally {
      setSaving(false)
    }
  }

  const getCityName = (cityId: string) => cities.find(c => c.id === cityId)?.name || cityId

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Areas</h1>
          <p className="text-sm text-gray-500 mt-1">Manage areas within cities</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Area
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search areas..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
            <Select
              value={cityFilter}
              onValueChange={(value) => { setCityFilter(value); setPage(1) }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
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
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchAreas}>Retry</Button>
            </div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MapPin className="h-8 w-8 mb-2" />
              <p>No areas found</p>
              {(search || cityFilter) && <p className="text-sm">Try adjusting your filters</p>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">City</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((area) => (
                      <tr key={area.id} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{area.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{getCityName(area.cityId)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={area.isActive ? "success" : "secondary"}>
                            {area.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(area)}>Edit</Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => { setDeletingArea(area); setDeleteDialogOpen(true) }}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingArea ? "Edit Area" : "Add Area"}</DialogTitle>
            <DialogDescription>
              {editingArea ? "Update area details" : "Create a new area within a city"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Nizampet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Select
                value={formData.cityId}
                onValueChange={(value) => setFormData({ ...formData, cityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.cityId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingArea ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Area</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {deletingArea?.name}? This action can be reversed by reactivating.
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
    </div>
  )
}
