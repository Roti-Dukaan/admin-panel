"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Loader2, PackageCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dispatchApi } from "@/features/dispatch/services/dispatch.api";
import { DISPATCH_STATUS_META, type DispatchBatchListItem } from "@/features/dispatch/types/dispatch";
import { Badge } from "@/components/ui/badge";
import { formatIstDateTime } from "@/lib/date";

export default function BranchDispatchHistoryPage() {
  const [page, setPage] = useState(1);

  const historyQuery = useQuery({
    queryKey: ["dispatch", "history", page],
    queryFn: () => dispatchApi.getHistory({ page, limit: 20 }),
  });

  const batches = historyQuery.data?.items ?? [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        titleNode={
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dispatch History</h1>
            <p className="text-sm text-gray-500">Completed and cancelled batches</p>
          </div>
        }
        showSearch={false}
        actions={null}
      />

      <div className="p-6">
        {historyQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <PackageCheck className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No dispatch history yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {batches.map((batch: any) => {
              const meta = DISPATCH_STATUS_META[batch.status as keyof typeof DISPATCH_STATUS_META];
              return (
                <div
                  key={batch.id}
                  className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">#{batch.batchNumber}</p>
                      <p className="text-xs text-gray-500">
                        {batch.totalOrders} order{batch.totalOrders !== 1 ? "s" : ""}
                        {batch.deliveryZone ? ` • ${batch.deliveryZone}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {meta && (
                      <Badge className={`${meta.bg} ${meta.color} border-0 text-xs`}>
                        {meta.label}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatIstDateTime(batch.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}

            {historyQuery.data && historyQuery.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {historyQuery.data!.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(historyQuery.data!.totalPages, p + 1))}
                  disabled={page >= historyQuery.data!.totalPages}
                  className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
