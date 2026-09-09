"use client";

import { History, RotateCw, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useFulfillmentJobs,
  useRetryFulfillmentJob,
} from "../hooks/useSubscriptions";
import type { FulfillmentJob } from "../types/subscription";

function statusVariant(status: string): "success" | "warning" | "destructive" | "secondary" | "info" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PARTIALLY_COMPLETED":
      return "warning";
    case "FAILED":
      return "destructive";
    case "RUNNING":
      return "info";
    default:
      return "secondary";
  }
}

export function FulfillmentHistory() {
  const { data, isLoading } = useFulfillmentJobs(1, 20);
  const retry = useRetryFulfillmentJob();
  const jobs = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5 text-teal-600" /> Fulfillment Run History
          </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading runs…
          </div>
        ) : jobs.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No fulfillment runs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Target Date</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Scanned</th>
                  <th className="px-2 py-2">Orders</th>
                  <th className="px-2 py-2">Skipped</th>
                  <th className="px-2 py-2">Failed</th>
                  <th className="px-2 py-2">Triggered By</th>
                  <th className="px-2 py-2">Started</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job: FulfillmentJob) => (
                  <tr key={job.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-2 py-2 font-medium text-gray-800">
                      {new Date(job.targetDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-2 py-2">
                      <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                    </td>
                    <td className="px-2 py-2 text-gray-600">{job.subscriptionsScanned}</td>
                    <td className="px-2 py-2 text-gray-900 font-semibold">{job.ordersCreated}</td>
                    <td className="px-2 py-2 text-gray-600">{job.skipped}</td>
                    <td className="px-2 py-2">
                      {job.failed > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="h-3.5 w-3.5" /> {job.failed}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-gray-500">{job.triggeredBy}</td>
                    <td className="px-2 py-2 text-gray-500">
                      {new Date(job.startedAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {job.failed > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={retry.isPending}
                          onClick={() => retry.mutate(job.id)}
                        >
                          {retry.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCw className="h-3.5 w-3.5" />
                          )}
                          Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {retry.isSuccess && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Retry completed.
          </div>
        )}
        {retry.isError && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Retry failed.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
