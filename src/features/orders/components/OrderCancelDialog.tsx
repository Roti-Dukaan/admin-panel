"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  resolveOrderCancelReason,
  type OrderCancelReasonOption,
} from "../constants/order-cancel-reasons";
import { OrderCancelReasonForm } from "./OrderCancelReasonForm";

type OrderCancelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber?: string | null;
  confirming?: boolean;
  onConfirm: (reason: string) => void;
  idPrefix?: string;
};

export function OrderCancelDialog({
  open,
  onOpenChange,
  orderNumber,
  confirming = false,
  onConfirm,
  idPrefix = "order-cancel",
}: OrderCancelDialogProps) {
  const [selected, setSelected] = useState<OrderCancelReasonOption | null>(null);
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setOtherText("");
    }
  }, [open]);

  const resolvedReason = useMemo(
    () => resolveOrderCancelReason(selected, otherText),
    [selected, otherText],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel order {orderNumber}</DialogTitle>
          <DialogDescription>
            This removes the order from the kitchen queue and marks it cancelled. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <OrderCancelReasonForm
          selected={selected}
          onSelectedChange={setSelected}
          otherText={otherText}
          onOtherTextChange={setOtherText}
          idPrefix={idPrefix}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            disabled={!resolvedReason || confirming}
            onClick={() => {
              if (!resolvedReason) return;
              onConfirm(resolvedReason);
            }}
          >
            {confirming ? "Cancelling…" : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
