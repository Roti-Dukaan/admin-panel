/**
 * Browser notification + audio cues for the realtime layer.
 *
 * Browsers block autoplay until the user interacts with the page. There is no
 * separate "sound permission" prompt — managers must click once to unlock audio.
 * Call {@link enableOrderAlerts} from a button click on first visit.
 */

const ORDER_ALERTS_ENABLED_KEY = "roti-order-alerts-enabled";
const ORDER_ALERTS_ENABLED_EVENT = "order-alerts-enabled";
const RING_AUDIO_PATH = "/sounds/order-alert.wav";

let audioCtx: AudioContext | null = null;
let lastChimeAt = 0;
let audioUnlockBound = false;
let ringInterval: ReturnType<typeof setInterval> | null = null;
let ringOscillators: OscillatorNode[] = [];
let ringAudio: HTMLAudioElement | null = null;
let ringAudioPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

function getRingAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!ringAudio) {
    ringAudio = new Audio(RING_AUDIO_PATH);
    ringAudio.loop = true;
    ringAudio.preload = "auto";
    ringAudio.volume = 1;
  }
  return ringAudio;
}

/** Create + buffer the alert audio once so playback starts instantly later. */
export function preloadOrderAudio(): void {
  const audio = getRingAudio();
  try {
    audio?.load();
  } catch {
    /* ignore */
  }
}

/** Whether the looping order ring is currently active. */
export function isOrderRinging(): boolean {
  return ringAudioPlaying || ringInterval !== null;
}

/** Whether audio has been unlocked and can play without a user gesture. */
export function canPlayOrderAlerts(): boolean {
  return isOrderAlertsEnabled();
}

/** Whether the manager explicitly enabled sound alerts this session. */
export function isOrderAlertsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ORDER_ALERTS_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function markOrderAlertsEnabled(): void {
  try {
    sessionStorage.setItem(ORDER_ALERTS_ENABLED_KEY, "true");
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

/**
 * Wire one-time listeners so incidental clicks resume a suspended AudioContext.
 * Prefer {@link enableOrderAlerts} for the explicit first-visit UX.
 */
export function unlockAudio(): void {
  if (typeof window === "undefined" || audioUnlockBound) return;
  audioUnlockBound = true;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx?.state === "suspended") {
      void ctx.resume().catch(() => undefined);
    }
    const audio = getRingAudio();
    if (audio) {
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          markOrderAlertsEnabled();
        })
        .catch(() => undefined);
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };

  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
}

/**
 * Enable order alert sound — must be invoked from a user gesture (button click).
 * Plays a short test ring and persists the enabled flag for this session.
 */
export async function enableOrderAlerts(): Promise<boolean> {
  const ctx = getAudioContext();
  const audio = getRingAudio();
  if (!ctx && !audio) return false;

  try {
    if (ctx?.state === "suspended") {
      await ctx.resume();
    }
  } catch {
    /* Web Audio unlock failed — try HTML audio below */
  }

  let htmlAudioOk = false;
  if (audio) {
    try {
      audio.currentTime = 0;
      await audio.play();
      htmlAudioOk = true;
      window.setTimeout(() => {
        if (!ringAudioPlaying) {
          audio.pause();
          audio.currentTime = 0;
        }
      }, 900);
    } catch {
      htmlAudioOk = false;
    }
  }

  const webAudioOk = ctx?.state === "running";
  if (!htmlAudioOk && webAudioOk) {
    playChime();
  }

  const enabled = htmlAudioOk || webAudioOk;
  if (enabled) markOrderAlertsEnabled();
  return enabled;
}

/** Play a short two-tone chime. Safe to call repeatedly; throttled to 1.5s. */
export function playChime(): void {
  const now = Date.now();
  if (now - lastChimeAt < 1500) return;
  lastChimeAt = now;

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    const beep = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration);
    };
    const t = ctx.currentTime;
    beep(880, t, 0.16);
    beep(1175, t + 0.14, 0.18);
  } catch {
    /* audio not available */
  }
}

function startWebAudioRing(): boolean {
  stopWebAudioRing();
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return false;

  const playRingPulse = () => {
    try {
      if (ctx.state === "suspended") return;
      const t = ctx.currentTime;
      const beep = (freq: number, startAt: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.4, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + duration);
        ringOscillators.push(osc);
      };
      beep(880, t, 0.2);
      beep(1175, t + 0.22, 0.24);
    } catch {
      /* ignore */
    }
  };

  playRingPulse();
  ringInterval = setInterval(playRingPulse, 1400);
  return true;
}

function stopWebAudioRing(): void {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  ringOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
  });
  ringOscillators = [];
}

/** Start ring after attempting to resume a suspended AudioContext. */
export async function tryStartOrderRing(): Promise<boolean> {
  if (!isOrderAlertsEnabled()) return false;

  const ctx = getAudioContext();
  if (ctx?.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* fall through to HTML audio */
    }
  }

  return startOrderRing();
}

/**
 * Start a looping alert until {@link stopOrderRing} is called.
 * If the ring is already playing (e.g. a second order arrives), it keeps
 * playing uninterrupted instead of restarting from zero.
 */
export async function startOrderRing(): Promise<boolean> {
  if (!isOrderAlertsEnabled()) {
    stopOrderRing();
    return false;
  }
  if (isOrderRinging()) return true;

  const audio = getRingAudio();
  if (audio) {
    audio.currentTime = 0;
    ringAudioPlaying = true;
    try {
      await audio.play();
      return true;
    } catch {
      ringAudioPlaying = false;
    }
  }

  return startWebAudioRing();
}

/** Stop the looping order ring started by {@link startOrderRing}. */
export function stopOrderRing(): void {
  ringAudioPlaying = false;
  const audio = getRingAudio();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  stopWebAudioRing();
}

/**
 * Consolidated audio-manager surface for the order alert ring:
 * unlock() / play() / stop() / canPlay(), plus preload + isRinging helpers.
 */
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
