"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { connectRealtime, emitRealtime, getRealtimeSocket, onRealtime } from "@/lib/realtime/socket";
import { REALTIME_EVENTS, type SupportTicketTypingPayload } from "@/lib/realtime/events";

const IDLE_MS = 2_500;
const RECEIVER_HIDE_MS = 5_000;

export function useSupportTicketTyping(ticketId: string | undefined, canType: boolean) {
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerTypingLabel, setPeerTypingLabel] = useState("Customer is typing");
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingActiveRef = useRef(false);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const joinTicketRoom = useCallback(() => {
    if (!ticketId) return;
    emitRealtime(REALTIME_EVENTS.SUPPORT_JOIN_TICKET, { ticketId });
  }, [ticketId]);

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
    joinTicketRoom();
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      emitTyping(true);
    }
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      typingActiveRef.current = false;
      emitTyping(false);
    }, IDLE_MS);
  }, [canType, ticketId, emitTyping, joinTicketRoom]);

  useEffect(() => {
    if (!ticketId || !accessToken) return;

    connectRealtime(accessToken);
    joinTicketRoom();

    const onConnect = () => joinTicketRoom();
    const socket = getRealtimeSocket();
    socket.on("connect", onConnect);

    const onTyping = (payload: SupportTicketTypingPayload) => {
      if (payload.ticketId !== ticketId) return;
      if (payload.senderType !== "CUSTOMER") return;

      if (payload.isTyping) {
        setPeerTypingLabel("Customer is typing");
        setPeerTyping(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setPeerTyping(false), RECEIVER_HIDE_MS);
      } else {
        setPeerTyping(false);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      }
    };

    const cleanup = onRealtime(REALTIME_EVENTS.SUPPORT_TICKET_TYPING, onTyping as (p: unknown) => void);

    return () => {
      socket.off("connect", onConnect);
      cleanup();
      stopTyping();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [accessToken, ticketId, stopTyping, joinTicketRoom]);

  return { customerTyping: peerTyping, peerTypingLabel, notifyTyping, stopTyping };
}
