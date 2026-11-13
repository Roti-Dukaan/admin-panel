"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
  /** Stack above NewOrderAlertModal (z-[9999]). */
  elevated?: boolean;
};

export function OrderCancelDialog({
  open,
  onOpenChange,
  orderNumber,
  confirming = false,
  onConfirm,
  idPrefix = "order-cancel",
  elevated = false,
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

  const body = (
    <>
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
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {elevated ? (
        <DialogPortal>
          <DialogOverlay className="z-[10000]" />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-[10001] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
            )}
          >
            {body}
          </DialogPrimitive.Content>
        </DialogPortal>
      ) : (
        <DialogContent>{body}</DialogContent>
      )}
    </Dialog>
  );
}
