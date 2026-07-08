"use client";

import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { useDeliverySlotStore } from "@/features/delivery-slots/hooks/useDeliverySlots";

export function DeleteConfirmation() {
  const deleteModalOpen = useDeliverySlotStore((s) => s.deleteModalOpen);
  const slotToDelete = useDeliverySlotStore((s) => s.slotToDelete);
  const closeDeleteModal = useDeliverySlotStore((s) => s.closeDeleteModal);
  const deleteSlot = useDeliverySlotStore((s) => s.deleteSlot);

  if (!deleteModalOpen || !slotToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDeleteModal} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 mx-auto mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
        <h3 className="text-lg font-bold text-gray-900 text-center">Delete Slot</h3>
        <p className="mt-2 text-sm text-gray-500 text-center">Are you sure you want to delete <strong>{slotToDelete.displayName}</strong>? This action cannot be undone.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={closeDeleteModal} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => deleteSlot(slotToDelete.id)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}
