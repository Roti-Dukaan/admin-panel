"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRunFulfillment } from "../hooks/useSubscriptions";
import type { FulfillmentResult } from "../types/subscription";
import { tomorrowDateKey } from "@/lib/date";

export function FulfillmentRunner() {
  const [targetDate, setTargetDate] = useState(tomorrowDateKey());
  const run = useRunFulfillment();
  const result = run.data as FulfillmentResult | undefined;

  const handleRun = () => {
    run.mutate(
      { targetDate, triggeredBy: "ADMIN" },
      {
        onSuccess: (data) => {
          const summary = data as FulfillmentResult;
          toast.success(
            `Fulfillment complete: ${summary.ordersCreated} orders, ${summary.deliveriesCreated} new deliveries`
          );
        },
        onError: () => {
          toast.error("Fulfillment run failed. Check backend logs for details.");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Play className="h-5 w-5 text-emerald-500" /> Fulfillment Run
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Generate tomorrow&apos;s subscription orders, reserve inventory, and build kitchen/delivery
          forecasts for the selected date.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">Target delivery date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button onClick={handleRun} disabled={run.isPending}>
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {run.isPending ? "Running…" : "Run Fulfillment"}
          </Button>
        </div>

        {result && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Run summary</span>
              <Badge variant="success">
                {new Date(result.targetDate).toLocaleDateString("en-IN")}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="Scanned" value={result.subscriptionsScanned} />
              <Mini label="Planned" value={result.occurrencesPlanned} />
              <Mini label="Orders" value={result.ordersCreated} />
              <Mini label="Deliveries" value={result.deliveriesCreated} />
              <Mini label="Skipped" value={result.skipped} />
              <Mini label="Failed" value={result.failed} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-center">
      <p className="text-base font-bold text-gray-900">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}
