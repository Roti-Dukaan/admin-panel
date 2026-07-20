"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { downloadKitchenReport } from "../useKitchenProduction";
import type { KitchenReportType } from "../types";

const REPORTS: { value: KitchenReportType; label: string }[] = [
  { value: "daily_production", label: "Daily Production" },
  { value: "food_consumption", label: "Food Consumption" },
  { value: "meal_count", label: "Meal Count" },
  { value: "batch", label: "Batch Report" },
];

export function ReportsBar({ date }: { date: string }) {
  const [type, setType] = useState<KitchenReportType>("daily_production");
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await downloadKitchenReport({ type, format, date });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select value={type} onValueChange={(v) => setType(v as KitchenReportType)}>
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {REPORTS.map((r) => (
            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "excel" | "pdf")}>
        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="excel">Excel</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={run} disabled={busy}>
        {busy ? "Exporting…" : "Export Report"}
      </Button>
    </div>
  );
}
