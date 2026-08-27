"use client";

import { X } from "lucide-react";
import { MealSlotsPanel } from "./MealSlotsPanel";

type MealSlotsDialogProps = {
  open: boolean;
  planId: string | null;
  planName?: string;
  onClose: () => void;
};

export function MealSlotsDialog({ open, planId, planName, onClose }: MealSlotsDialogProps) {
  if (!open || !planId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Configure meal slots</h2>
            {planName && <p className="text-sm text-gray-500">{planName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <MealSlotsPanel planId={planId} />
        </div>
      </div>
    </div>
  );
}
