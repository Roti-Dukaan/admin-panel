"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { DocumentType } from "../types/document";

interface DocumentPreviewState {
  orderId: string | null;
  documentType: DocumentType | null;
}

interface DocumentPreviewContextValue {
  state: DocumentPreviewState;
  openDocument: (orderId: string, documentType: DocumentType) => void;
  closeDocument: () => void;
}

const DocumentPreviewContext = createContext<DocumentPreviewContextValue | null>(null);

export function DocumentPreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DocumentPreviewState>({
    orderId: null,
    documentType: null,
  });

  const openDocument = useCallback((orderId: string, documentType: DocumentType) => {
    setState({ orderId, documentType });
  }, []);

  const closeDocument = useCallback(() => {
    setState({ orderId: null, documentType: null });
  }, []);

  const value = useMemo(
    () => ({ state, openDocument, closeDocument }),
    [state, openDocument, closeDocument],
  );

  return (
    <DocumentPreviewContext.Provider value={value}>{children}</DocumentPreviewContext.Provider>
  );
}

export function useDocumentPreview() {
  const ctx = useContext(DocumentPreviewContext);
  if (!ctx) {
    throw new Error("useDocumentPreview must be used within DocumentPreviewProvider");
  }
  return ctx;
}
