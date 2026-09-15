"use client";

import { useEffect } from "react";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import {
  connectRealtime,
  ensureRealtimeAuth,
  onRealtime,
} from "@/lib/realtime/socket";
import {
  REALTIME_EVENTS,
  type AdminSupportTicketRepliedPayload,
  type AdminSupportTicketUpdatedPayload,
} from "@/lib/realtime/events";

/**
 * Refreshes an open support ticket when the conversation or status changes.
 * Uses Socket.IO; pull-to-refresh / send still work if the socket is offline.
 */
export function useSupportTicketRealtime(
  ticketId: string | undefined,
  onRefresh: () => void,
  branchId?: string | null,
) {
  const accessToken = useAdminAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!ticketId || !accessToken) return;

    ensureRealtimeAuth(accessToken);
    connectRealtime(accessToken);

    const refreshIfMatch = (payload: { ticketId: string }) => {
      if (payload.ticketId === ticketId) {
        onRefresh();
      }
    };

    const cleanups = [
      onRealtime(REALTIME_EVENTS.ADMIN_SUPPORT_TICKET_REPLIED, (payload: AdminSupportTicketRepliedPayload) => {
        refreshIfMatch(payload);
      }),
      onRealtime(REALTIME_EVENTS.ADMIN_SUPPORT_TICKET_UPDATED, (payload: AdminSupportTicketUpdatedPayload) => {
        refreshIfMatch(payload);
      }),
    ];

    if (branchId) {
      cleanups.push(
        onRealtime(REALTIME_EVENTS.BRANCH_SUPPORT_TICKET_REPLIED, (payload: AdminSupportTicketRepliedPayload) => {
          refreshIfMatch(payload);
        }),
        onRealtime(REALTIME_EVENTS.BRANCH_SUPPORT_TICKET_UPDATED, (payload: AdminSupportTicketUpdatedPayload) => {
          refreshIfMatch(payload);
        }),
      );
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [accessToken, ticketId, branchId, onRefresh]);
}
