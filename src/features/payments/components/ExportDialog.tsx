"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  format: 'csv' | 'excel';
}

export function ExportDialog({ open, onClose, format }: ExportDialogProps) {
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success(`${format.toUpperCase()} export completed successfully`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            {format === 'csv' ? (
              <FileText className="h-5 w-5 text-emerald-600" />
            ) : (
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Export {format.toUpperCase()}</h3>
            <p className="text-xs text-gray-500">Download payment transactions report</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 mb-5">
          <p className="text-sm text-gray-600">
            This will export all currently filtered payment transactions to a <span className="font-semibold">{format.toUpperCase()}</span> file.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
