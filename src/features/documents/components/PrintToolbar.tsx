"use client";

import { PrintButton } from "./PrintButton";
import { DownloadPDFButton } from "./DownloadPDFButton";

export function PrintToolbar({
  onPrint,
  onDownload,
  downloading,
  disablePrint,
  disableDownload,
}: {
  onPrint: () => void;
  onDownload: () => void;
  downloading?: boolean;
  disablePrint?: boolean;
  disableDownload?: boolean;
}) {
  return (
    <div className="no-print flex flex-wrap items-center justify-end gap-2">
      <PrintButton onPrint={onPrint} disabled={disablePrint} />
      <DownloadPDFButton onDownload={onDownload} loading={downloading} disabled={disableDownload} />
    </div>
  );
}
