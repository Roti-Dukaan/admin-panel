"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, QrCode, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inHouseRiderApi, type InHouseCodStop } from "@/features/realtime-dispatch/services/in-house-cod.api";
import { CodQrImage } from "@/features/realtime-dispatch/components/CodQrImage";

type CodQrModalProps = {
  stop: InHouseCodStop;
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
};

export function CodQrModal({ stop, open, onClose, onPaid }: CodQrModalProps) {
  const expected = stop.codExpectedAmount ?? stop.grandTotal;

  const qrMutation = useMutation({
    mutationFn: () => inHouseRiderApi.createCodQr(stop.orderId),
    onError: (err: Error) => toast.error(err.message || "Failed to create QR"),
  });

  const statusQuery = useQuery({
    queryKey: ["cod-qr-status", stop.orderId],
    queryFn: () => inHouseRiderApi.getCodQrStatus(stop.orderId),
    enabled: open && (qrMutation.isSuccess || !!qrMutation.data),
    refetchInterval: (query) =>
      query.state.data?.status === "qr_paid" ? false : 5000,
  });

  const closeMutation = useMutation({
    mutationFn: () => inHouseRiderApi.closeCodQr(stop.orderId),
    onSuccess: () => {
      toast.success("QR cancelled");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to close QR"),
  });

  React.useEffect(() => {
    if (open) qrMutation.mutate();
  }, [open, stop.orderId]);

  React.useEffect(() => {
    if (statusQuery.data?.status === "qr_paid") {
      toast.success("Payment received");
      onPaid();
    }
  }, [statusQuery.data?.status, onPaid]);

  const qr = qrMutation.data ?? statusQuery.data;
  const isPaid = qr?.status === "qr_paid" || stop.codCollectionStatus === "QR_PAID";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            COD Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-semibold">{stop.orderNumber}</p>
            <p className="text-sm text-gray-600">{stop.customerName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-3xl font-bold">₹{expected}</p>
          </div>

          {qrMutation.isPending ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : qr?.qrImageUrl ? (
            <CodQrImage src={qr.qrImageUrl} size={280} />
          ) : qrMutation.isError ? (
            <p className="text-sm text-red-600">
              {(qrMutation.error as Error)?.message || "Failed to create QR. Check Razorpay config and retry."}
            </p>
          ) : (
            <p className="text-sm text-red-600">QR not available</p>
          )}

          <p className="text-sm text-gray-600">Ask customer to scan and pay</p>

          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
            Payment status:{" "}
            <span className="font-semibold">
              {isPaid ? "Payment received" : qr?.status === "payment_pending" ? "Waiting for payment" : "Awaiting collection"}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {!isPaid && (
            <>
              <Button
                variant="outline"
                className="w-full"
                disabled={statusQuery.isFetching}
                onClick={() => statusQuery.refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh payment status
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel QR
              </Button>
            </>
          )}
          {isPaid && (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={onClose}>
              Continue to mark delivered
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
