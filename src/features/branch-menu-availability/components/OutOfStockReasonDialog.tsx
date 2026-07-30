"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OutOfStockReasonDialogProps {
  open: boolean;
  itemName: string;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function OutOfStockReasonDialog({
  open,
  itemName,
  loading = false,
  onConfirm,
  onCancel,
}: OutOfStockReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open, itemName]);

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please enter a reason for marking this item out of stock.");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Out of Stock</DialogTitle>
          <DialogDescription>
            Provide a reason for marking <span className="font-medium text-gray-700">{itemName}</span> as out of stock. This will be visible in the Reason column.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="out-of-stock-reason" className="text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="out-of-stock-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            rows={3}
            placeholder="e.g. Supplier delay, ingredient unavailable..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            disabled={loading}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
