"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { citiesApi, type City } from "@/lib/api/master-data/cities.api"
import { areasApi, type Area } from "@/lib/api/master-data/areas.api"
import { branchesApi, type Branch } from "@/lib/api/master-data/branches.api"

export interface DashboardLocationFiltersValue {
  cityId?: string
  areaId?: string
  branchId?: string
}

interface DashboardLocationFiltersProps {
  value: DashboardLocationFiltersValue
  onChange: (value: DashboardLocationFiltersValue) => void
  className?: string
}

function unwrapPaginatedList<T>(response: { data?: { data?: { items?: T[] } | T[] } }): T[] {
  const payload = response.data?.data
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  return []
}

export function DashboardLocationFilters({
  value,
  onChange,
  className,
}: DashboardLocationFiltersProps) {
  const [cities, setCities] = React.useState<City[]>([])
  const [areas, setAreas] = React.useState<Area[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])

  React.useEffect(() => {
    citiesApi
      .getAllActive()
      .then((res) => setCities(res.data?.data ?? []))
      .catch(() => setCities([]))
  }, [])

  React.useEffect(() => {
    if (!value.cityId) {
      setAreas([])
      return
    }

    areasApi
      .getByCityId(value.cityId)
      .then((res) => setAreas(res.data?.data ?? []))
      .catch(() => setAreas([]))
  }, [value.cityId])

  React.useEffect(() => {
    branchesApi
      .list({
        limit: 200,
        isActive: true,
        cityId: value.cityId,
        areaId: value.areaId,
      })
      .then((res) => setBranches(unwrapPaginatedList(res)))
      .catch(() => setBranches([]))
  }, [value.cityId, value.areaId])

  return (
    <div className={className ?? "flex flex-wrap items-center gap-2"}>
      <Select
        value={value.cityId ?? "all"}
        onValueChange={(v) =>
          onChange({
            cityId: v === "all" ? undefined : v,
            areaId: undefined,
            branchId: undefined,
          })
        }
      >
        <SelectTrigger className="h-8 w-[140px] rounded-lg border-gray-200 bg-white text-xs">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.areaId ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...value,
            areaId: v === "all" ? undefined : v,
            branchId: undefined,
          })
        }
        disabled={!value.cityId}
      >
        <SelectTrigger className="h-8 w-[140px] rounded-lg border-gray-200 bg-white text-xs">
          <SelectValue placeholder="All Areas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Areas</SelectItem>
          {areas.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              {area.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.branchId ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...value,
            branchId: v === "all" ? undefined : v,
          })
        }
      >
        <SelectTrigger className="h-8 w-[160px] rounded-lg border-gray-200 bg-white text-xs">
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
