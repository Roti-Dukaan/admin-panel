/**
 * Browser notification + order alert audio (Howler.js).
 *
 * Browsers block autoplay until the user interacts with the page. Managers must
 * click "Enable Sound Alerts" once; Howler auto-unlocks on subsequent gestures.
 */

import { Howl, Howler } from "howler";

const ORDER_ALERTS_ENABLED_KEY = "roti-order-alerts-enabled";
const ORDER_ALERTS_ENABLED_EVENT = "order-alerts-enabled";
const RING_AUDIO_PATH = "/sounds/order-alert.wav";

let orderRing: Howl | null = null;
let ringActive = false;
let audioUnlockBound = false;

function getOrderRing(): Howl | null {
  if (typeof window === "undefined") return null;
  if (!orderRing) {
    Howler.autoUnlock = true;
    Howler.volume(1);

    orderRing = new Howl({
      src: [RING_AUDIO_PATH],
      loop: true,
      volume: 1,
      preload: true,
      html5: false,
    });
  }
  return orderRing;
}

/** Create + buffer the alert audio once so playback starts instantly later. */
export function preloadOrderAudio(): void {
  const howl = getOrderRing();
  if (!howl || howl.state() !== "unloaded") return;
  howl.load();
}

/** Whether the looping order ring is currently active. */
export function isOrderRinging(): boolean {
  const howl = getOrderRing();
  return ringActive && !!howl?.playing();
}

/** Whether audio has been unlocked and can play without a user gesture. */
export function canPlayOrderAlerts(): boolean {
  return isOrderAlertsEnabled() || ringActive;
}

/** Whether the manager explicitly enabled sound alerts (persists across visits). */
export function isOrderAlertsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ORDER_ALERTS_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function markOrderAlertsEnabled(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDER_ALERTS_ENABLED_KEY, "true");
    window.dispatchEvent(new Event(ORDER_ALERTS_ENABLED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Subscribe when alerts become enabled (explicit button or first page click). */
export function onOrderAlertsEnabledChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(ORDER_ALERTS_ENABLED_EVENT, listener);
  return () => window.removeEventListener(ORDER_ALERTS_ENABLED_EVENT, listener);
}

function playTestChime(howl: Howl): Promise<boolean> {
  // Never interrupt an active order ring (e.g. incidental click while modal is open).
  if (ringActive && howl.playing()) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (!ringActive) {
        howl.stop();
      } else if (howl.playing()) {
        howl.loop(true);
      }
      resolve(ok);
    };

    howl.once("playerror", () => finish(false));
    howl.once("loaderror", () => finish(false));

    if (howl.state() === "unloaded") {
      howl.once("load", () => {
        if (ringActive) {
          finish(true);
          return;
        }
        howl.loop(false);
        howl.play();
        window.setTimeout(() => finish(true), 900);
      });
      howl.load();
      return;
    }

    howl.loop(false);
    howl.play();
    window.setTimeout(() => finish(true), 900);
  });
}

/**
 * Wire one-time listeners so incidental clicks unlock Howler's audio context.
 * Prefer {@link enableOrderAlerts} for the explicit first-visit UX.
 */
function removeAudioUnlockListeners(unlock: () => void): void {
  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("keydown", unlock);
  window.removeEventListener("touchstart", unlock);
}

export function unlockAudio(): void {
  if (typeof window === "undefined" || audioUnlockBound) return;
  audioUnlockBound = true;

  const unlock = () => {
    Howler.autoUnlock = true;
    preloadOrderAudio();

    const finish = (ok: boolean) => {
      if (ok) markOrderAlertsEnabled();
      if (ok || !ringActive) {
        removeAudioUnlockListeners(unlock);
      }
    };

    if (isOrderAlertsEnabled()) {
      if (ringActive) {
        void startOrderRing().then(finish);
      } else {
        finish(true);
      }
      return;
    }

    if (ringActive) {
      void startOrderRing().then(finish);
      return;
    }

    const howl = getOrderRing();
    if (!howl) {
      removeAudioUnlockListeners(unlock);
      return;
    }

    void playTestChime(howl).then(finish);
  };

  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
}

/**
 * Enable order alert sound — must be invoked from a user gesture (button click).
 * Plays a short test ring and persists the enabled flag.
 */
export async function enableOrderAlerts(): Promise<boolean> {
  const howl = getOrderRing();
  if (!howl) return false;

  const ok = await playTestChime(howl);
  if (ok) markOrderAlertsEnabled();
  return ok;
}

/** Play a short two-tone chime (uses the same alert file, no loop). */
export function playChime(): void {
  if (!isOrderAlertsEnabled()) return;
  const howl = getOrderRing();
  if (!howl || ringActive) return;
  howl.loop(false);
  howl.play();
  window.setTimeout(() => {
    if (!ringActive) howl.stop();
  }, 400);
}

/** Start ring after alerts are enabled (legacy helper). */
export async function tryStartOrderRing(): Promise<boolean> {
  return startOrderRing();
}

/**
 * Start a looping alert until {@link stopOrderRing} is called.
 * Marks the ring as active immediately so keep-alive can retry after autoplay blocks.
 */
export async function startOrderRing(): Promise<boolean> {
  ringActive = true;

  const howl = getOrderRing();
  if (!howl) return false;
  if (howl.playing()) return true;

  return new Promise((resolve) => {
    const begin = () => {
      howl.loop(true);
      howl.volume(1);
      const soundId = howl.play();
      resolve(soundId !== undefined);
    };

    howl.once("playerror", () => resolve(false));
    howl.once("loaderror", () => resolve(false));

    if (howl.state() === "unloaded") {
      howl.once("load", begin);
      howl.load();
      return;
    }

    begin();
  });
}

/** Stop the looping order ring started by {@link startOrderRing}. */
export function stopOrderRing(): void {
  ringActive = false;
  orderRing?.stop();
}

/** Re-start the loop if it was interrupted while alerts are still open. */
export function ensureOrderRingPlaying(): void {
  if (!ringActive) return;
  const howl = getOrderRing();
  if (!howl || howl.playing()) return;
  howl.loop(true);
  howl.volume(1);
  howl.play();
}

/** Consolidated audio-manager surface for the order alert ring. */
export const orderAlertAudio = {
  preload: preloadOrderAudio,
  unlock: enableOrderAlerts,
  play: startOrderRing,
  stop: stopOrderRing,
  canPlay: canPlayOrderAlerts,
  isRinging: isOrderRinging,
} as const;

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
      silent: false,
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
