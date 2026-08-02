import { apiClient } from "@/lib/api/http";
import type { DeliveryLabelData, DocumentType, KitchenTicketData } from "../types/document";

function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

function parseFileName(disposition?: string, fallback = "document.pdf"): string {
  if (!disposition) return fallback;
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? fallback;
}

async function parseBlobError(blob: Blob, fallback: string): Promise<never> {
  try {
    const text = await blob.text();
    const body = JSON.parse(text) as { message?: string };
    throw new Error(body.message || fallback);
  } catch {
    throw new Error(fallback);
  }
}

export const documentsApi = {
  getKitchenTicket: (orderId: string): Promise<KitchenTicketData> =>
    unwrap(apiClient.get(`/admin/orders/${encodeURIComponent(orderId)}/documents/kitchen-ticket`)),

  getDeliveryLabel: (orderId: string): Promise<DeliveryLabelData> =>
    unwrap(apiClient.get(`/admin/orders/${encodeURIComponent(orderId)}/documents/delivery-label`)),

  downloadPdf: async (
    orderId: string,
    type: Exclude<DocumentType, "INVOICE">,
  ): Promise<{ blob: Blob; fileName: string }> => {
    const path =
      type === "KITCHEN_TICKET"
        ? `/admin/orders/${encodeURIComponent(orderId)}/documents/kitchen-ticket/pdf`
        : `/admin/orders/${encodeURIComponent(orderId)}/documents/delivery-label/pdf`;

    const response = await apiClient.get(path, { responseType: "blob" });
    const blob = response.data as Blob;
    if (blob.type.includes("application/json")) {
      await parseBlobError(blob, "Failed to download PDF");
    }
    const fileName = parseFileName(
      response.headers["content-disposition"] as string | undefined,
      `${type.toLowerCase()}-${orderId}.pdf`,
    );
    return { blob, fileName };
  },
};

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
