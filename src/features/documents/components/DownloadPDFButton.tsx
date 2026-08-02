"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadPDFButton({
  onDownload,
  loading,
  disabled,
}: {
  onDownload: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      onClick={onDownload}
      disabled={disabled || loading}
      className="gap-2 bg-gray-900 hover:bg-gray-800"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download PDF
    </Button>
  );
}
