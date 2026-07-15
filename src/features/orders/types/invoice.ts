export type InvoiceState = "PENDING" | "GENERATED" | "FAILED" | "REGENERATED";

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string;
  status: InvoiceState;
  downloadUrl?: string | null;
  generatedAt: string;
  errorMessage?: string | null;
}

export interface InvoiceView {
  invoice: InvoiceEntity | null;
  state: InvoiceState;
}
