"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { subscriptionsApi } from "@/features/subscriptions/services/subscriptions.api";
import { useOpsBranchStore } from "@/features/subscriptions/hooks/useOpsBranch";
import { addDaysIst, todayDateKey } from "@/lib/date";

const REPORTS = [
  { value: "daily_production", label: "Daily Production Report" },
  { value: "weekly_production", label: "Weekly Production Report" },
  { value: "monthly_subscription", label: "Monthly Subscription Report" },
  { value: "delivery", label: "Delivery Report" },
  { value: "revenue", label: "Revenue Report" },
  { value: "kitchen_consumption", label: "Kitchen Consumption Report" },
] as const;

export function OpsReportsTab() {
  const [type, setType] = useState<string>("daily_production");
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [dateFrom, setDateFrom] = useState(addDaysIst(new Date(), -30));
  const [dateTo, setDateTo] = useState(todayDateKey());
  const [loading, setLoading] = useState(false);
  const branchId = useOpsBranchStore((s) => s.selectedBranchId);

  const run = async () => {
    setLoading(true);
    try {
      const blob = await subscriptionsApi.exportOpsReport({ type, format, dateFrom, dateTo, branchId: branchId ?? undefined });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = format === "excel" ? "xlsx" : format;
      a.href = url;
      a.download = `${type}-${dateFrom}_${dateTo}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <h3 className="text-sm font-semibold">Generate Report</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Report</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {REPORTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Format</Label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div>
            <Label>From</Label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <Label>To</Label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <Button onClick={run} disabled={loading} className="w-full md:w-auto">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Generate & Export"}
        </Button>
      </CardContent>
    </Card>
  );
}
