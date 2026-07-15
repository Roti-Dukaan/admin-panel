/**
 * Browser notification + audio cues for the realtime layer.
 *
 * - `playChime()` plays a short, pleasant two-tone beep via the Web Audio API
 *   (no asset required) and de-dupes so a burst of events never machine-guns.
 * - `ensureNotificationPermission()` prompts once for OS notifications.
 * - `showOrderNotification()` raises a notification; `onClick` fires when the
 *   user clicks it (used to focus the tab + open the order).
 */

let audioCtx: AudioContext | null = null;
let lastChimeAt = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Play a short two-tone chime. Safe to call repeatedly; throttled to 1.5s. */
export function playChime(): void {
  const now = Date.now();
  if (now - lastChimeAt < 1500) return;
  lastChimeAt = now;

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();
    const beep = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration);
    };
    const t = ctx.currentTime;
    beep(880, t, 0.16);
    beep(1175, t + 0.14, 0.18);
  } catch {
    /* audio not available — ignore */
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

/** Prompt for notification permission (call from a user gesture for best UX). */
export function ensureNotificationPermission(): void {
  if (!notificationsSupported()) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission().catch(() => undefined);
  }
}

export function showOrderNotification(
  title: string,
  body: string,
  onClick?: () => void,
): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const notification = new Notification(title, {
      body,
      tag: "kitchen-new-order",
      silent: true,
      icon: "/favicon.ico",
    });
    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
  } catch {
    /* ignore */
  }
}
