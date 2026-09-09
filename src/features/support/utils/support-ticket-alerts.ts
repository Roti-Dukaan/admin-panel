import { toast } from "sonner";

const STORAGE_PREFIX = "support-ticket-alerts-viewed";
const MAX_VIEWED = 500;

export function supportTicketToastId(ticketId: string): string {
  return `support-ticket-alert:${ticketId}`;
}

export function supportTicketReplyToastId(ticketId: string): string {
  return `support-ticket-reply:${ticketId}`;
}

function storageKey(adminId: string): string {
  return `${STORAGE_PREFIX}:${adminId}`;
}

export function getViewedSupportTicketIds(adminId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(adminId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function isSupportTicketViewed(adminId: string, ticketId: string): boolean {
  return getViewedSupportTicketIds(adminId).has(ticketId);
}

export function markSupportTicketViewed(adminId: string, ticketId: string): void {
  if (typeof window === "undefined" || !adminId || !ticketId) return;
  const viewed = getViewedSupportTicketIds(adminId);
  viewed.add(ticketId);
  const ids = [...viewed];
  if (ids.length > MAX_VIEWED) {
    ids.splice(0, ids.length - MAX_VIEWED);
  }
  localStorage.setItem(storageKey(adminId), JSON.stringify(ids));
}

export function dismissSupportTicketAlerts(ticketId: string): void {
  toast.dismiss(supportTicketToastId(ticketId));
  toast.dismiss(supportTicketReplyToastId(ticketId));
}
