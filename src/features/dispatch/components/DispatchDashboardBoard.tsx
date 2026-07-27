"use client";

import { useRouter } from "next/navigation";
import { PackagePlus, Loader2, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatchBatches, useUpdateBatchStatus } from "../hooks/useDispatch";
import { useDispatchRealtime } from "../hooks/useDispatchRealtime";
import { DispatchStats } from "./DispatchStats";
import { DispatchBatchCard } from "./DispatchBatchCard";
import { DispatchBatchDrawer } from "./DispatchBatchDrawer";
import type { DispatchBatchListItem, DispatchBatchDetail } from "../types/dispatch";
import { useState } from "react";
import { useDispatchDashboard, useDispatchBatchDetail } from "../hooks/useDispatch";

export function DispatchDashboardBoard() {
  const router = useRouter();
  const [selectedBatch, setSelectedBatch] = useState<DispatchBatchListItem | null>(null);
  const detailQuery = useDispatchBatchDetail(selectedBatch?.id ?? null);
  const dashboardQuery = useDispatchDashboard();
  const batchesQuery = useDispatchBatches({ status: "all", limit: 50 });

  useDispatchRealtime();

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50/50 p-6">
      <DispatchStats data={dashboardQuery.data} isLoading={dashboardQuery.isLoading} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Active Dispatches</h2>
        <Button
          onClick={() => router.push("/dispatch/batches")}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <PackagePlus className="mr-2 h-4 w-4" />
          Create Batch
        </Button>
      </div>

      {batchesQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (batchesQuery.data?.items ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <PackageX className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No active dispatch batches.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {batchesQuery.data!.items.map((batch) => (
            <DispatchBatchCard key={batch.id} batch={batch} onOpen={setSelectedBatch} />
          ))}
        </div>
      )}

      <DispatchBatchDrawer
        batch={detailQuery.data ?? null}
        onClose={() => setSelectedBatch(null)}
      />
    </div>
  );
}
