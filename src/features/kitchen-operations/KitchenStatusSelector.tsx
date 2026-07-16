"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { KitchenStatusBadge, KITCHEN_STATUS_CONFIG } from "./KitchenStatusBadge";
import type { KitchenStatusValue } from "@/lib/api/kitchen.api";
import { useKitchenStatus, useUpdateKitchenStatus } from "./useKitchenOperations";

export function KitchenStatusSelector() {
  const { data, isLoading } = useKitchenStatus();
  const updateMutation = useUpdateKitchenStatus();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<KitchenStatusValue | null>(null);
  const [message, setMessage] = useState("");

  const status = data?.status ?? "OPEN";

  const handleChange = (value: KitchenStatusValue) => {
    if (value !== status) {
      if (value === "BUSY" || value === "CLOSED" || value === "MAINTENANCE") {
        setPendingStatus(value);
        setMessage(data?.message ?? "");
        setShowMessageModal(true);
      } else {
        updateMutation.mutate({ status: value, message: data?.message ?? undefined });
      }
    }
  };

  const handleSave = () => {
    if (pendingStatus) {
      updateMutation.mutate({ status: pendingStatus, message: message.trim() || undefined });
    }
    setShowMessageModal(false);
    setPendingStatus(null);
  };

  if (isLoading) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Kitchen:</span>
        <Select value={status} onValueChange={handleChange}>
          <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs">
            <SelectValue>
              <KitchenStatusBadge status={status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(KITCHEN_STATUS_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value} className="text-xs">
                <KitchenStatusBadge status={value as KitchenStatusValue} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Kitchen Status</DialogTitle>
            <DialogDescription>
              Add a customer-facing message for when kitchen is {pendingStatus?.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Kitchen is currently busy. Expect slight delays..."
            rows={3}
            maxLength={300}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}