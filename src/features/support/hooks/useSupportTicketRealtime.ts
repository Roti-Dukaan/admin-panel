"use client";

import { useEffect, useRef } from "react";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  connectRealtime,
  disconnectRealtime,
  onRealtime,
} from "@/lib/realtime/socket";
import {
  REALTIME_EVENTS,
  type AdminSupportTicketRepliedPayload,
  type AdminSupportTicketUpdatedPayload,
} from "@/lib/realtime/events";

const CONVERSATION_POLL_MS = 8_000;

/**
 * Keeps an open support ticket in sync (Socket.IO + short polling fallback).
 * HQ admins listen on admin rooms; branch managers on branch (+ kitchen) rooms.
 */
export function useSupportTicketRealtime(
  ticketId: string | undefined,
  onRefresh: () => void,
  ticketBranchId?: string | null,
) {
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const { branchId: workspaceBranchId } = useWorkspace();
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const branchScopeId = ticketBranchId ?? workspaceBranchId ?? null;
  const listenBranch = !!branchScopeId;

  useEffect(() => {
    if (!ticketId || !accessToken) return;

    connectRealtime(accessToken);

    const refreshIfMatch = (payload: { ticketId?: string }) => {
      if (payload.ticketId === ticketId) {
        onRefreshRef.current();
      }
    };

    const cleanups: Array<() => void> = [];

    cleanups.push(
      onRealtime(REALTIME_EVENTS.ADMIN_SUPPORT_TICKET_REPLIED, (payload: AdminSupportTicketRepliedPayload) => {
        refreshIfMatch(payload);
      }),
      onRealtime(REALTIME_EVENTS.ADMIN_SUPPORT_TICKET_UPDATED, (payload: AdminSupportTicketUpdatedPayload) => {
        refreshIfMatch(payload);
      }),
    );

    if (listenBranch) {
      cleanups.push(
        onRealtime(REALTIME_EVENTS.BRANCH_SUPPORT_TICKET_REPLIED, (payload: AdminSupportTicketRepliedPayload) => {
          refreshIfMatch(payload);
        }),
        onRealtime(REALTIME_EVENTS.BRANCH_SUPPORT_TICKET_UPDATED, (payload: AdminSupportTicketUpdatedPayload) => {
          refreshIfMatch(payload);
        }),
      );
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPoll = () => {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
        onRefreshRef.current();
      }, CONVERSATION_POLL_MS);
    };

    const stopPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        onRefreshRef.current();
        startPoll();
      } else {
        stopPoll();
      }
    };

    startPoll();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      stopPoll();
      document.removeEventListener("visibilitychange", onVisibility);
      disconnectRealtime();
    };
  }, [accessToken, ticketId, listenBranch, branchScopeId]);
}
