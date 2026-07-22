"use client"

import { useState, useEffect, useCallback } from "react"
import { citiesApi, type City, type CreateCityDTO, type UpdateCityDTO } from "@/lib/api/master-data/cities.api"
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
import { Building2, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 20

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [formData, setFormData] = useState<CreateCityDTO>({
    name: "",
    code: "",
    state: "",
    country: "India",
  })
  const [saving, setSaving] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCity, setDeletingCity] = useState<City | null>(null)

  const fetchCities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await citiesApi.list({ search, page, limit: ITEMS_PER_PAGE })
      setCities(response.data.data.items)
      setTotal(response.data.data.total)
    } catch (err) {
      setError("Failed to load cities")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const resetForm = () => {
    setFormData({ name: "", code: "", state: "", country: "India" })
    setEditingCity(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (city: City) => {
    setEditingCity(city)
    setFormData({
      name: city.name,
      code: city.code,
      state: city.state,
      country: city.country,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingCity) {
        await citiesApi.update(editingCity.id, formData)
        toast.success("City updated successfully")
      } else {
        await citiesApi.create(formData)
        toast.success("City created successfully")
      }
      setDialogOpen(false)
      resetForm()
      fetchCities()
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save city"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingCity) return
    setSaving(true)
    try {
      await citiesApi.archive(deletingCity.id)
      toast.success("City archived successfully")
      setDeleteDialogOpen(false)
      setDeletingCity(null)
      fetchCities()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive city")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (city: City) => {
    try {
      await citiesApi.update(city.id, { isActive: !city.isActive })
      toast.success(city.isActive ? "City deactivated" : "City activated")
      fetchCities()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cities</h1>
          <p className="text-sm text-gray-500 mt-1">Manage cities for branch operations</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add City
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cities..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
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
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchCities}>
                Retry
              </Button>
            </div>
          ) : cities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Building2 className="h-8 w-8 mb-2" />
              <p>No cities found</p>
              {search && <p className="text-sm">Try adjusting your search</p>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Code</th>
                      <th className="pb-3 pr-4">State</th>
                      <th className="pb-3 pr-4">Country</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((city) => (
                      <tr key={city.id} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{city.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{city.code}</td>
                        <td className="py-3 pr-4 text-gray-600">{city.state}</td>
                        <td className="py-3 pr-4 text-gray-600">{city.country}</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleToggleStatus(city)}
                            className="cursor-pointer"
                          >
                            <Badge variant={city.isActive ? "success" : "secondary"}>
                              {city.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(city)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => { setDeletingCity(city); setDeleteDialogOpen(true) }}
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
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
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
            <DialogTitle>{editingCity ? "Edit City" : "Add City"}</DialogTitle>
            <DialogDescription>
              {editingCity ? "Update city details" : "Create a new city for branch operations"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hyderabad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., HYD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Telangana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., India"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.code || !formData.state}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCity ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Archive City</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {deletingCity?.name}? This action can be reversed by reactivating.
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
