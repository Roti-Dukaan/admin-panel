"use client";

import { DocumentPreviewProvider, useDocumentPreview } from "./context/DocumentPreviewContext";
import { DocumentPreviewModal } from "./components/DocumentPreviewModal";

function DocumentPreviewHost() {
  const { state, closeDocument } = useDocumentPreview();
  return (
    <DocumentPreviewModal
      open={!!state.orderId && !!state.documentType}
      orderId={state.orderId}
      documentType={state.documentType}
      onClose={closeDocument}
    />
  );
}

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  return (
    <DocumentPreviewProvider>
      {children}
      <DocumentPreviewHost />
    </DocumentPreviewProvider>
  );
}
