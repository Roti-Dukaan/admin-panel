"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { connectRealtime, emitRealtime, onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS, type SupportTicketTypingPayload } from "@/lib/realtime/events";

const IDLE_MS = 2_500;
const RECEIVER_HIDE_MS = 4_000;

export function useSupportTicketTyping(ticketId: string | undefined, canType: boolean) {
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const [customerTyping, setCustomerTyping] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingActiveRef = useRef(false);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!ticketId) return;
      emitRealtime(REALTIME_EVENTS.SUPPORT_TICKET_TYPING, { ticketId, isTyping });
    },
    [ticketId],
  );

  const stopTyping = useCallback(() => {
    clearIdleTimer();
    if (typingActiveRef.current) {
      typingActiveRef.current = false;
      emitTyping(false);
    }
  }, [emitTyping]);

  const notifyTyping = useCallback(() => {
    if (!canType || !ticketId) return;
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      emitTyping(true);
    }
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      typingActiveRef.current = false;
      emitTyping(false);
    }, IDLE_MS);
  }, [canType, ticketId, emitTyping]);

  useEffect(() => {
    if (!ticketId || !accessToken) return;

    connectRealtime(accessToken);

    const onTyping = (payload: SupportTicketTypingPayload) => {
      if (payload.ticketId !== ticketId) return;
      if (payload.senderType !== "CUSTOMER") return;

      if (payload.isTyping) {
        setCustomerTyping(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setCustomerTyping(false), RECEIVER_HIDE_MS);
      } else {
        setCustomerTyping(false);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      }
    };

    const cleanup = onRealtime(REALTIME_EVENTS.SUPPORT_TICKET_TYPING, onTyping as (p: unknown) => void);

    return () => {
      cleanup();
      stopTyping();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [accessToken, ticketId, stopTyping]);

  return { customerTyping, notifyTyping, stopTyping };
}
