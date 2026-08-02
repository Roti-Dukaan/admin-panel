"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ordersApi } from "@/lib/api/orders.api";
import { documentsApi, saveBlob } from "../services/documents.api";
import type {
  DeliveryLabelData,
  DocumentType,
  KitchenTicketData,
} from "../types/document";
import { KitchenTicket } from "./KitchenTicket";
import { DeliveryLabel } from "./DeliveryLabel";
import { PrintToolbar } from "./PrintToolbar";
import { InvoiceCard } from "@/features/orders/components/InvoiceCard";
import { printThermalLabel } from "../utils/printThermalLabel";
import "../styles/thermal-print.css";

const TITLES: Record<DocumentType, string> = {
  INVOICE: "Customer Invoice",
  KITCHEN_TICKET: "Kitchen Ticket",
  DELIVERY_LABEL: "Delivery Label",
};

export function DocumentPreviewModal({
  open,
  orderId,
  documentType,
  onClose,
}: {
  open: boolean;
  orderId: string | null;
  documentType: DocumentType | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [kitchen, setKitchen] = useState<KitchenTicketData | null>(null);
  const [delivery, setDelivery] = useState<DeliveryLabelData | null>(null);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !orderId || !documentType) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setKitchen(null);
      setDelivery(null);
      setInvoicePdfUrl(null);

      try {
        if (documentType === "KITCHEN_TICKET") {
          const data = await documentsApi.getKitchenTicket(orderId);
          if (!cancelled) setKitchen(data);
        } else if (documentType === "DELIVERY_LABEL") {
          const data = await documentsApi.getDeliveryLabel(orderId);
          if (!cancelled) setDelivery(data);
        } else if (documentType === "INVOICE") {
          const view = await ordersApi.getInvoice(orderId);
          const url = view.invoice?.downloadUrl;
          if (!cancelled && url) setInvoicePdfUrl(url);
        }
      } catch {
        if (!cancelled) toast.error("Could not load document preview");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, orderId, documentType]);

  const handlePrint = useCallback(() => {
    if (documentType === "INVOICE") {
      if (invoicePdfUrl) window.open(invoicePdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    printThermalLabel("thermal-print-content");
  }, [documentType, invoicePdfUrl]);

  const handleDownload = useCallback(async () => {
    if (!orderId || !documentType) return;

    if (documentType === "INVOICE") {
      try {
        const res = await ordersApi.getInvoice(orderId);
        if (res.invoice?.downloadUrl) {
          window.open(res.invoice.downloadUrl, "_blank", "noopener,noreferrer");
        } else {
          toast.info("Invoice PDF is not ready yet");
        }
      } catch {
        toast.error("Failed to download invoice");
      }
      return;
    }

    setDownloading(true);
    try {
      const { blob, fileName } = await documentsApi.downloadPdf(orderId, documentType);
      saveBlob(blob, fileName);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  }, [orderId, documentType]);

  if (!documentType) return null;

  const isThermal = documentType !== "INVOICE";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={
          isThermal
            ? "max-h-[95vh] max-w-lg overflow-y-auto"
            : "max-h-[95vh] max-w-3xl overflow-y-auto"
        }
      >
        <DialogHeader className="no-print pr-8">
          <DialogTitle>{TITLES[documentType]}</DialogTitle>
        </DialogHeader>

        <div className="no-print mb-4">
          <PrintToolbar
            onPrint={handlePrint}
            onDownload={() => void handleDownload()}
            downloading={downloading}
            disablePrint={loading}
            disableDownload={loading}
          />
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className={isThermal ? "flex justify-center bg-gray-100 p-4" : ""}>
            {documentType === "KITCHEN_TICKET" && kitchen ? <KitchenTicket data={kitchen} /> : null}
            {documentType === "DELIVERY_LABEL" && delivery ? (
              <DeliveryLabel data={delivery} />
            ) : null}
            {documentType === "INVOICE" && orderId ? (
              <div className="space-y-4">
                {invoicePdfUrl ? (
                  <iframe
                    title="Invoice preview"
                    src={invoicePdfUrl}
                    className="h-[70vh] w-full rounded-lg border border-gray-200 bg-white"
                  />
                ) : (
                  <InvoiceCard orderId={orderId} />
                )}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
