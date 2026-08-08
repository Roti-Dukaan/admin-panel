"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supportApi, type SupportTicket } from "@/lib/api/support.api";
import type { AdminSupportTicketNewPayload } from "@/lib/realtime/events";

const POLL_MS = 10_000;

function toAlertPayload(ticket: SupportTicket): AdminSupportTicketNewPayload {
  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    customerId: ticket.customerId,
    branchId: ticket.branchId ?? null,
    category: ticket.category,
    priority: ticket.priority,
    subject: ticket.subject,
    status: ticket.status,
    occurredAt: ticket.createdAt,
  };
}

/**
 * Polls open support tickets for HQ admins so new-ticket toasts still fire when
 * Socket.IO is offline or the admin missed the realtime event.
 */
export function useGlobalSupportTicketPoll(
  enabled: boolean,
  onNewTicket: (payload: AdminSupportTicketNewPayload) => void,
) {
  const onAlertRef = useRef(onNewTicket);
  onAlertRef.current = onNewTicket;

  const pollSeen = useRef<Set<string>>(new Set());
  const bootstrapped = useRef(false);

  const query = useQuery({
    queryKey: ["support", "global-ticket-alerts", "hq"],
    queryFn: () => supportApi.list({ status: "OPEN", limit: 30 }),
    enabled,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    staleTime: POLL_MS,
  });

  useEffect(() => {
    const items = query.data?.data.items;
    if (!items?.length) {
      if (!bootstrapped.current) bootstrapped.current = true;
      return;
    }

    if (!bootstrapped.current) {
      for (const ticket of items) {
        pollSeen.current.add(ticket.id);
      }
      bootstrapped.current = true;
      return;
    }

    for (const ticket of items) {
      if (pollSeen.current.has(ticket.id)) continue;
      pollSeen.current.add(ticket.id);
      onAlertRef.current(toAlertPayload(ticket));
    }
  }, [query.data?.data.items]);

  return query;
}
