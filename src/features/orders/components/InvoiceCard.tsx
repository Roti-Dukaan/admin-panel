"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api/orders.api";
import type { InvoiceView } from "../types/invoice";

export function InvoiceCard({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const [regenerating, setRegenerating] = useState(false);

  const { data, isLoading } = useQuery<InvoiceView>({
    queryKey: ["order-invoice", orderId],
    queryFn: () => ordersApi.getInvoice(orderId),
    enabled: !!orderId,
  });

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      await ordersApi.regenerateInvoice(orderId);
      toast.success("Invoice regenerated");
      queryClient.invalidateQueries({ queryKey: ["order-invoice", orderId] });
    } catch {
      toast.error("Failed to regenerate invoice");
    } finally {
      setRegenerating(false);
    }
  };

  const invoice = data?.invoice ?? null;
  const ready =
    invoice && (data?.state === "GENERATED" || data?.state === "REGENERATED");

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <FileText className="h-4 w-4 text-gray-500" />
          GST Invoice
        </h3>
        {invoice && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {invoice.status}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading invoice…
        </p>
      ) : ready && invoice ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-mono text-xs font-medium">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Issued</span>
              <span className="font-medium">
                {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!invoice.downloadUrl}
              onClick={() =>
                window.open(invoice.downloadUrl ?? "", "_blank", "noopener,noreferrer")
              }
            >
              <Eye className="mr-1 h-4 w-4" /> View
            </Button>
            <a
              href={invoice.downloadUrl ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button variant="outline" size="sm" disabled={!invoice.downloadUrl}>
                <Download className="mr-1 h-4 w-4" /> Download
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Regenerate
            </Button>
          </div>
        </div>
      ) : data?.state === "FAILED" ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">
            Invoice generation failed. You can regenerate it.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-4 w-4" />
            )}
            Regenerate
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Invoice is being generated. It will be available shortly.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["order-invoice", orderId] })
            }
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
