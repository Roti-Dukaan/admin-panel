"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  connectRealtime,
  ensureRealtimeAuth,
  onRealtime,
} from "@/lib/realtime/socket";
import {
  REALTIME_EVENTS,
  type AdminSupportTicketNewPayload,
  type AdminSupportTicketRepliedPayload,
} from "@/lib/realtime/events";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useGlobalSupportTicketPoll } from "@/features/support/hooks/useGlobalSupportTicketPoll";

const SUPPORT_TOAST_DURATION_MS = 12_000;
const PUBLIC_ROUTES = ["/login", "/invitations"];

function isPublicRoute(pathname: string): boolean {
  return pathname === "/" || PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** HQ admin panel only — branch managers do not receive support popups. */
function canReceiveSupportAlerts(role: string | null, isBranchManager: boolean): boolean {
  if (isBranchManager) return false;
  if (!role) return false;
  if (role === "DELIVERY_BOY") return false;
  return true;
}

export function SupportTicketAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isBranchManager } = useWorkspace();
  const role = useAdminAuthStore((s) => s.role);
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const seenNewTickets = useRef<Set<string>>(new Set());
  const seenReplies = useRef<Set<string>>(new Set());

  const alertsEnabled =
    isAuthenticated &&
    !!accessToken &&
    !isPublicRoute(pathname) &&
    canReceiveSupportAlerts(role, isBranchManager);

  const showNewTicketToast = useCallback(
    (payload: AdminSupportTicketNewPayload) => {
      const dedupeKey = `new:${payload.ticketId}`;
      if (seenNewTickets.current.has(dedupeKey)) return;
      seenNewTickets.current.add(dedupeKey);

      toast.info("New support ticket", {
        description: `${payload.ticketNumber} · ${payload.subject} (${formatCategory(payload.category)})`,
        duration: SUPPORT_TOAST_DURATION_MS,
        action: {
          label: "View ticket",
          onClick: () => router.push(`/support/${payload.ticketId}`),
        },
      });
    },
    [router],
  );

  const showReplyToast = useCallback(
    (payload: AdminSupportTicketRepliedPayload) => {
      const dedupeKey = `reply:${payload.ticketId}:${payload.occurredAt}`;
      if (seenReplies.current.has(dedupeKey)) return;
      seenReplies.current.add(dedupeKey);

      toast.message("Customer replied on support ticket", {
        description: `${payload.ticketNumber} · ${payload.messagePreview}`,
        duration: SUPPORT_TOAST_DURATION_MS,
        action: {
          label: "Open chat",
          onClick: () => router.push(`/support/${payload.ticketId}`),
        },
      });
    },
    [router],
  );

  useGlobalSupportTicketPoll(alertsEnabled, showNewTicketToast);

  useEffect(() => {
    if (!alertsEnabled || !accessToken) return;

    ensureRealtimeAuth(accessToken);
    connectRealtime(accessToken);

    const cleanups = [
      onRealtime(
        REALTIME_EVENTS.ADMIN_SUPPORT_TICKET_NEW,
        (payload: AdminSupportTicketNewPayload) => {
          showNewTicketToast(payload);
        },
      ),
      onRealtime(
        REALTIME_EVENTS.ADMIN_SUPPORT_TICKET_REPLIED,
        (payload: AdminSupportTicketRepliedPayload) => {
          showReplyToast(payload);
        },
      ),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [accessToken, alertsEnabled, showNewTicketToast, showReplyToast]);

  return <>{children}</>;
}
