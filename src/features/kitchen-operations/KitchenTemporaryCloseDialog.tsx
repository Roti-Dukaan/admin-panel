"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatetimeAmPmInput } from "@/components/shared/DatetimeAmPmInput";
import { formatIstDateTime } from "@/lib/date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KITCHEN_CLOSURE_REASON_OPTIONS,
  defaultScheduledReopenLocalValue,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type KitchenClosureReasonCode,
  type KitchenTemporaryClosePayload,
} from "./kitchen-closure.constants";
import { realtimeOrderHoursApi } from "@/lib/api/realtime-order-hours.api";
import { formatIstDateTime } from "@/lib/date";

type KitchenTemporaryCloseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  initialReasonCode?: KitchenClosureReasonCode | null;
  initialCustom?: string | null;
  initialReopenAt?: string | null;
  onConfirm: (payload: KitchenTemporaryClosePayload) => void;
};

export function KitchenTemporaryCloseDialog({
  open,
  onOpenChange,
  saving = false,
  initialReasonCode,
  initialCustom,
  initialReopenAt,
  onConfirm,
}: KitchenTemporaryCloseDialogProps) {
  const [reasonCode, setReasonCode] = useState<KitchenClosureReasonCode>("MAINTENANCE");
  const [customReason, setCustomReason] = useState("");
  const [reopenLocal, setReopenLocal] = useState(defaultScheduledReopenLocalValue());
  const [error, setError] = useState<string | null>(null);
  const [globalPreview, setGlobalPreview] = useState<{
    adjusted: boolean;
    effectiveReopenAt: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setReasonCode(initialReasonCode ?? "MAINTENANCE");
    setCustomReason(initialCustom ?? "");
    setReopenLocal(
      initialReopenAt ? toDatetimeLocalValue(initialReopenAt) : defaultScheduledReopenLocalValue(),
    );
    setError(null);
    setGlobalPreview(null);
  }, [open, initialReasonCode, initialCustom, initialReopenAt]);

  useEffect(() => {
    if (!open) return;
    const iso = fromDatetimeLocalValue(reopenLocal);
    if (!iso || new Date(iso).getTime() <= Date.now()) {
      setGlobalPreview(null);
      return;
    }
    const t = window.setTimeout(() => {
      realtimeOrderHoursApi
        .previewReopen(iso)
        .then((res) =>
          setGlobalPreview({
            adjusted: res.data.data.adjustedForGlobalHours,
            effectiveReopenAt: res.data.data.effectiveReopenAt,
          }),
        )
        .catch(() => setGlobalPreview(null));
    }, 350);
    return () => window.clearTimeout(t);
  }, [open, reopenLocal]);

  const handleConfirm = () => {
    if (reasonCode === "OTHER" && !customReason.trim()) {
      setError('Enter a custom reason when "Other" is selected.');
      return;
    }
    const scheduledReopenAt = fromDatetimeLocalValue(reopenLocal);
    if (!scheduledReopenAt) {
      setError("Select the expected reopening date and time.");
      return;
    }
    if (new Date(scheduledReopenAt).getTime() <= Date.now()) {
      setError("Reopening time must be in the future.");
      return;
    }
    onConfirm({
      closureReasonCode: reasonCode,
      closureReasonCustom: reasonCode === "OTHER" ? customReason.trim() : undefined,
      scheduledReopenAt: globalPreview?.effectiveReopenAt ?? scheduledReopenAt,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Temporarily close kitchen</DialogTitle>
          <DialogDescription>
            Select or enter the reason for closing this kitchen. The kitchen will automatically reopen
            at the time you set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for closure</Label>
            <Select
              value={reasonCode}
              onValueChange={(v) => {
                setReasonCode(v as KitchenClosureReasonCode);
                setError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {KITCHEN_CLOSURE_REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reasonCode === "OTHER" ? (
            <div className="space-y-2">
              <Label htmlFor="kitchen-close-custom">Custom reason</Label>
              <Textarea
                id="kitchen-close-custom"
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Describe why the kitchen is closing"
                rows={3}
                maxLength={300}
              />
            </div>
          ) : null}

            <DatetimeAmPmInput
              id="kitchen-reopen-at"
              value={reopenLocal}
              onChange={(next) => {
                setReopenLocal(next);
                if (error) setError(null);
              }}
            />
            {reopenLocal && fromDatetimeLocalValue(reopenLocal) ? (
              <p className="text-xs text-muted-foreground">
                Selected: {formatIstDateTime(fromDatetimeLocalValue(reopenLocal)!)}
              </p>
            ) : null}
              }}
            />
          </div>

          {globalPreview?.adjusted ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              That time is outside global order hours. Kitchen will reopen at{" "}
              <strong>{formatIstDateTime(globalPreview.effectiveReopenAt)}</strong> (IST) instead.
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Close kitchen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
