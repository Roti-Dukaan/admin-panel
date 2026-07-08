"use client";

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { useMenuStore } from "../hooks/useMenu";

export function DeleteConfirmation() {
  const { deleteModalOpen, foodToDelete, closeDeleteModal, deleteFood } = useMenuStore();

  if (!foodToDelete) return null;

  return (
    <AnimatePresence>
      {deleteModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={closeDeleteModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Food Item</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete <strong>{foodToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <button onClick={closeDeleteModal} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteFood(foodToDelete.id)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete Item
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
