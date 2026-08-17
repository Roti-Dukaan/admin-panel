"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSubscriptionPlanStore } from "@/features/subscription-plans/hooks/useSubscriptionPlans";

function extractError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message) && message.length) return String(message[0]);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function DeleteConfirmation() {
  const deleteModalOpen = useSubscriptionPlanStore((s) => s.deleteModalOpen);
  const planToDelete = useSubscriptionPlanStore((s) => s.planToDelete);
  const closeDeleteModal = useSubscriptionPlanStore((s) => s.closeDeleteModal);
  const deletePlan = useSubscriptionPlanStore((s) => s.deletePlan);
  const [deleting, setDeleting] = useState(false);

  if (!deleteModalOpen || !planToDelete) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePlan(planToDelete.id);
      toast.success(`${planToDelete.name} deactivated`);
    } catch (error) {
      toast.error(extractError(error, "Could not delete plan"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={deleting ? undefined : closeDeleteModal}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center">Delete Plan</h3>
        <p className="mt-2 text-sm text-gray-500 text-center">
          Are you sure you want to delete <strong>{planToDelete.name}</strong>? The plan will be
          deactivated and hidden from new subscriptions. Existing subscriptions are not affected.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={closeDeleteModal}
            disabled={deleting}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete Plan"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
