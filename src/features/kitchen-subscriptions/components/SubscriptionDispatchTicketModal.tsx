"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrintToolbar } from "@/features/documents/components/PrintToolbar";
import { printThermalLabel } from "@/features/documents/utils/printThermalLabel";
import "@/features/documents/styles/thermal-print.css";
import type { SubscriptionPrepRow } from "../types/kitchen-subscriptions";
import { SubscriptionDispatchTicket } from "./SubscriptionDispatchTicket";

export function SubscriptionDispatchTicketModal({
  row,
  open,
  onClose,
}: {
  row: SubscriptionPrepRow | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[95vh] max-w-lg overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle>Dispatch Ticket — {row.customerName}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <PrintToolbar
            onPrint={() => printThermalLabel("subscription-dispatch-ticket")}
            onDownload={() => {}}
            disableDownload
          />
        </div>

        <p className="mb-3 text-sm text-gray-600">
          Print this ticket after starting prep. Then mark the delivery as <strong>Packed</strong>, and
          finally <strong>Handover</strong> when ready for dispatch.
        </p>

        <div className="flex justify-center bg-gray-100 p-4">
          <SubscriptionDispatchTicket row={row} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
