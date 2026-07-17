"use client"

import * as React from "react"
import { Calendar, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type DateRangePreset = "today" | "yesterday" | "7d" | "30d" | "this-month" | "custom"

export interface DateRangeValue {
  preset: DateRangePreset
  startDate?: string
  endDate?: string
}

interface DateRangeFilterProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  className?: string
}

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "this-month", label: "This Month" },
  { key: "custom", label: "Custom Range" },
]

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [customStart, setCustomStart] = React.useState(value.startDate || "")
  const [customEnd, setCustomEnd] = React.useState(value.endDate || "")

  React.useEffect(() => {
    setCustomStart(value.startDate || "")
    setCustomEnd(value.endDate || "")
  }, [value.startDate, value.endDate])

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === "custom") {
      onChange({ preset, startDate: customStart, endDate: customEnd })
    } else {
      onChange({ preset })
    }
  }

  const handleCustomDateChange = (type: "start" | "end", dateVal: string) => {
    const newStart = type === "start" ? dateVal : customStart
    const newEnd = type === "end" ? dateVal : customEnd
    setCustomStart(newStart)
    setCustomEnd(newEnd)
    if (value.preset === "custom") {
      onChange({ preset: "custom", startDate: newStart, endDate: newEnd })
    }
  }

  const handleClear = () => {
    setCustomStart("")
    setCustomEnd("")
    onChange({ preset: "today" })
  }

  const isCustomActive = value.preset === "custom"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="hidden sm:inline">Date</span>
      </div>

      <div className="relative">
        <select
          value={value.preset}
          onChange={(e) => handlePresetSelect(e.target.value as DateRangePreset)}
          className="h-8 appearance-none rounded-lg border border-gray-200 bg-white pl-2.5 pr-7 text-xs font-medium text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 transition-colors cursor-pointer"
        >
          {PRESETS.map((preset) => (
            <option key={preset.key} value={preset.key}>
              {preset.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isCustomActive && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStart}
            onChange={(e) => handleCustomDateChange("start", e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 transition-colors"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => handleCustomDateChange("end", e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 transition-colors"
          />
        </div>
      )}

      {value.preset !== "today" && (
        <button
          onClick={handleClear}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Reset filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
