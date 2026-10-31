import { extractApiError } from "@/lib/api/extract-api-error";

/** True when the kitchen ticket was already advanced by another manager/tab. */
export function isKitchenStageAlreadyHandledError(error: unknown): boolean {
  const message = extractApiError(error, "").toLowerCase();
  if (!message) return false;
  return (
    message.includes("already being prepared") ||
    message.includes("already ready for pickup") ||
    message.includes("cannot start preparing") ||
    message.includes("invalid status transition")
  );
}
