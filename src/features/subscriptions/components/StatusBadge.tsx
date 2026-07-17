import { Badge } from "@/components/ui/badge";
import {
  SUBSCRIPTION_STATUS_CONFIG,
  OCCURRENCE_STATUS_CONFIG,
  type SubscriptionStatus,
  type SubscriptionOccurrenceStatus,
} from "../types/subscription";

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = SUBSCRIPTION_STATUS_CONFIG[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function OccurrenceStatusBadge({ status }: { status: SubscriptionOccurrenceStatus }) {
  const cfg = OCCURRENCE_STATUS_CONFIG[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
