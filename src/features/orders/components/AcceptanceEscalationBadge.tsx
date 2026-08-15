"use client";

import { cn } from "@/lib/utils";

export type AcceptanceStatus =
  | "pending_acceptance"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired"
  | "escalation_unresolved";

const LABELS: Record<AcceptanceStatus, string> = {
  pending_acceptance: "Pending acceptance",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
  escalation_unresolved: "Escalated (unresolved)",
};

const STYLES: Record<AcceptanceStatus, string> = {
  pending_acceptance: "bg-amber-50 text-amber-800 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
  cancelled: "bg-gray-50 text-gray-700 border-gray-200",
  expired: "bg-gray-50 text-gray-700 border-gray-200",
  escalation_unresolved: "bg-red-50 text-red-800 border-red-200",
};

export function AcceptanceEscalationBadge({
  acceptanceStatus,
  escalationAttemptCount,
  escalationMaxAttempts,
  escalationStatus,
  className,
}: {
  acceptanceStatus?: string | null;
  escalationAttemptCount?: number;
  escalationMaxAttempts?: number;
  escalationStatus?: string | null;
  className?: string;
}) {
  if (!acceptanceStatus) return null;

  const normalized = acceptanceStatus.toLowerCase().replace(/_/g, "_") as AcceptanceStatus;
  const label = LABELS[normalized] ?? acceptanceStatus;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          STYLES[normalized] ?? "bg-gray-50 text-gray-700 border-gray-200",
        )}
      >
        {label}
      </span>
      {escalationStatus && ["active", "acknowledged", "max_attempts_reached"].includes(escalationStatus.toLowerCase()) && (
        <span className="text-[10px] text-red-600 font-medium">
          {escalationStatus === "ACKNOWLEDGED" || escalationStatus === "acknowledged"
            ? "Manager acknowledged"
            : escalationAttemptCount != null && escalationMaxAttempts != null
              ? `Call ${escalationAttemptCount} of ${escalationMaxAttempts}`
              : "Escalated"}
        </span>
      )}
    </div>
  );
}
