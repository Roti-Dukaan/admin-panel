"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Loader2, RotateCcw, Save, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useKitchenStatus, useUpdateKitchenStatus } from "./useKitchenOperations";
import { KitchenStatusBadge, KITCHEN_STATUS_CONFIG } from "./KitchenStatusBadge";
import type { KitchenStatusValue } from "@/lib/api/kitchen.api";
import { KitchenTemporaryCloseDialog } from "./KitchenTemporaryCloseDialog";
import type { KitchenTemporaryClosePayload } from "./kitchen-closure.constants";
import { formatIstDateTime } from "@/lib/date";

const STATUS_OPTIONS: KitchenStatusValue[] = ["OPEN", "BUSY", "CLOSED", "MAINTENANCE"];

const formSchema = z.object({
  status: z.enum(["OPEN", "BUSY", "CLOSED", "MAINTENANCE"]),
  busyDelayMinutes: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(240, "Max 240 minutes"),
  message: z.string().max(300, "Max 300 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_MESSAGES: Record<KitchenStatusValue, string> = {
  OPEN: "",
  BUSY: "Kitchen is busy. Expect slight delivery delays.",
  CLOSED: "",
  MAINTENANCE: "Kitchen temporarily unavailable.",
};

export function KitchenOperationsCard({ compact = false }: { compact?: boolean } = {}) {
  const { data, isLoading, isError, refetch } = useKitchenStatus();
  const updateMutation = useUpdateKitchenStatus();
  const user = useAdminAuthStore((s) => s.user);

  const [status, setStatus] = useState<KitchenStatusValue>("OPEN");
  const [expanded, setExpanded] = useState(!compact);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "OPEN",
      busyDelayMinutes: 20,
      message: "",
    },
  });

  // Sync the form with fetched server state (once loaded).
  useEffect(() => {
    if (data) {
      setStatus(data.status);
      reset({
        status: data.status,
        busyDelayMinutes: data.busyDelayMinutes,
        message: data.message ?? DEFAULT_MESSAGES[data.status] ?? "",
      });
    }
  }, [data, reset]);

  const watchedStatus = watch("status");
  const isBusy = watchedStatus === "BUSY";

  const onStatusChange = (value: KitchenStatusValue) => {
    if (value === "CLOSED") {
      setCloseDialogOpen(true);
      return;
    }
    setStatus(value);
    setValue("status", value, { shouldDirty: true });
    // Pre-fill a sensible default message for the chosen status if empty.
    const currentMessage = watch("message");
    if (!currentMessage || currentMessage === DEFAULT_MESSAGES[status as KitchenStatusValue]) {
      setValue("message", DEFAULT_MESSAGES[value] ?? "", { shouldDirty: true });
    }
  };

  const onSubmit = (values: FormValues) => {
    if (values.status === "CLOSED") return;
    const payload = {
      status: values.status,
      busyDelayMinutes: values.busyDelayMinutes,
      message: values.message && values.message.trim() ? values.message.trim() : undefined,
    };
    updateMutation.mutate(payload);
  };

  const handleConfirmClose = (payload: KitchenTemporaryClosePayload) => {
    updateMutation.mutate(
      {
        status: "CLOSED",
        busyDelayMinutes: data?.busyDelayMinutes,
        ...payload,
      },
      { onSuccess: () => setCloseDialogOpen(false) },
    );
  };

  const handleReset = () => {
    if (data) {
      reset({
        status: data.status,
        busyDelayMinutes: data.busyDelayMinutes,
        message: data.message ?? DEFAULT_MESSAGES[data.status] ?? "",
      });
      setStatus(data.status);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading kitchen status…
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-gray-500">
            Could not load kitchen status. Make sure the backend is running and the
            database migration has been applied.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader
          onClick={compact ? () => setExpanded((v) => !v) : undefined}
          className={
            compact
              ? "flex flex-row items-center justify-between space-y-0 px-4 py-2.5 cursor-pointer"
              : "flex flex-row items-center justify-between space-y-0 border-b border-gray-100 px-6 py-4"
          }
        >
          <div className="flex items-center gap-2">
            <span
              className={
                compact
                  ? "flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50"
                  : "flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50"
              }
            >
              <UtensilsCrossed className={compact ? "h-4 w-4 text-orange-500" : "h-5 w-5 text-orange-500"} />
            </span>
            <div>
              <CardTitle className={compact ? "text-sm font-semibold text-gray-900" : "text-base font-semibold text-gray-900"}>
                Kitchen Operations
              </CardTitle>
              {!compact && (
                <p className="text-sm text-gray-500">Control whether new orders are accepted</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && <KitchenStatusBadge status={data.status} />}
            {compact && (
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            )}
          </div>
        </CardHeader>

        {expanded && (
        <CardContent className={compact ? "p-4 pt-2 border-t border-gray-100" : "p-6"}>
          <form onSubmit={handleSubmit(onSubmit)} className={compact ? "space-y-3" : "space-y-5"}>
            <div className={compact ? "flex flex-col gap-3 sm:flex-row sm:items-end" : "space-y-2"}>
              <div className={compact ? "space-y-1.5" : "space-y-2"}>
                <Label htmlFor="kitchen-status">Kitchen Status</Label>
                <Select value={status} onValueChange={(v) => onStatusChange(v as KitchenStatusValue)}>
                  <SelectTrigger id="kitchen-status" className={compact ? "w-full sm:w-48" : "w-full sm:w-64"}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {KITCHEN_STATUS_CONFIG[option].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isBusy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={compact ? "space-y-1.5" : "space-y-2"}
                >
                  <Label htmlFor="busy-delay">Busy Delay (minutes)</Label>
                  <Input
                    id="busy-delay"
                    type="number"
                    min={0}
                    max={240}
                    className={compact ? "w-full sm:w-40" : "w-full sm:w-64"}
                    {...register("busyDelayMinutes")}
                  />
                  {errors.busyDelayMinutes && (
                    <p className="text-xs text-red-500">{errors.busyDelayMinutes.message}</p>
                  )}
                  {!compact && (
                    <p className="text-xs text-gray-400">
                      Added to estimated delivery while the kitchen is busy.
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {watchedStatus !== "CLOSED" ? (
              <div className={compact ? "space-y-1.5" : "space-y-2"}>
                <Label htmlFor="kitchen-message">Custom customer message</Label>
                <Textarea
                  id="kitchen-message"
                  rows={compact ? 2 : 3}
                  placeholder="e.g. Kitchen is busy. Expect slight delivery delays."
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>
            ) : data?.scheduledReopenAt ? (
              <p className="text-sm text-gray-600">
                Auto-reopens {formatIstDateTime(data.scheduledReopenAt)}
              </p>
            ) : null}

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                size={compact ? "sm" : "default"}
                disabled={updateMutation.isPending || !isDirty}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
              <Button type="button" size={compact ? "sm" : "default"} variant="outline" onClick={handleReset} disabled={!isDirty}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
        )}
      </Card>
    </motion.div>

    <KitchenTemporaryCloseDialog
      open={closeDialogOpen}
      onOpenChange={setCloseDialogOpen}
      initialReasonCode={data?.closureReasonCode}
      initialCustom={data?.closureReasonCustom}
      initialReopenAt={data?.scheduledReopenAt}
      saving={updateMutation.isPending}
      onConfirm={handleConfirmClose}
    />
    </>
  );
}
