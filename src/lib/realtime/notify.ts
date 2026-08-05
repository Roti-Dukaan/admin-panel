/**
 * Order alert audio for localhost and production.
 *
 * File: public/sounds/ringing_old_phone.mp3
 * Browsers block autoplay until the user clicks "Enable Order Alert" once.
 */

const ORDER_ALERTS_ENABLED_KEY = "roti-order-alerts-enabled";
const ORDER_ALERTS_ENABLED_EVENT = "order-alerts-enabled";
const ORDER_ALERTS_VERIFIED_SESSION_KEY = "roti-order-alerts-verified-session";
const ORDER_ALERTS_VERIFIED_SESSION_EVENT = "order-alerts-verified-session";
const RING_AUDIO_PATH = "/sounds/ringing_old_phone.mp3";

let ringAudio: HTMLAudioElement | null = null;
let ringActive = false;
let unlockListenersAttached = false;
let loadPromise: Promise<boolean> | null = null;

function logAudio(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.warn(`[order-alert] ${message}`, detail);
  } else {
    console.warn(`[order-alert] ${message}`);
  }
}

function createRingAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!ringAudio) {
    ringAudio = document.createElement("audio");
    ringAudio.src = RING_AUDIO_PATH;
    ringAudio.preload = "auto";
    ringAudio.loop = true;
    ringAudio.volume = 1;
    ringAudio.setAttribute("playsinline", "true");
    ringAudio.style.display = "none";
    document.body.appendChild(ringAudio);
    ringAudio.addEventListener("error", () => {
      logAudio(`failed to load ${RING_AUDIO_PATH} — is the file in public/sounds/?`);
      loadPromise = null;
    });
  }
  return ringAudio;
}

function isAudioReady(audio: HTMLAudioElement): boolean {
  return audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

/** Ensure MP3 is loaded (with timeout so localhost dev never hangs silently). */
export function ensureAudioLoaded(): Promise<boolean> {
  const audio = createRingAudio();
  if (!audio) return Promise.resolve(false);
  if (isAudioReady(audio)) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("error", onError);
      if (!ok) loadPromise = null;
      resolve(ok);
    };

    const onReady = () => finish(true);
    const onError = () => finish(false);
    const timer = window.setTimeout(() => {
      finish(isAudioReady(audio));
    }, 5000);

    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audio.load();
  });

  return loadPromise;
}

export function preloadOrderAudio(): void {
  void ensureAudioLoaded();
}

async function playRing(loop: boolean): Promise<boolean> {
  const audio = createRingAudio();
  if (!audio) return false;

  const loaded = await ensureAudioLoaded();
  if (!loaded) {
    logAudio("audio file not ready — open /sounds/ringing_old_phone.mp3 in browser to verify");
    return false;
  }

  try {
    audio.loop = loop;
    audio.currentTime = 0;
    audio.volume = 1;
    await audio.play();
    return !audio.paused;
  } catch (error) {
    logAudio("play() blocked — click Enable Order Alert first", error);
    return false;
  }
}

export function isOrderRinging(): boolean {
  const audio = createRingAudio();
  return ringActive && !!audio && !audio.paused;
}

export function canPlayOrderAlerts(): boolean {
  return isOrderAlertsEnabled() || ringActive;
}

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
    sessionStorage.setItem(ORDER_ALERTS_VERIFIED_SESSION_KEY, "true");
    window.dispatchEvent(new Event(ORDER_ALERTS_ENABLED_EVENT));
    window.dispatchEvent(new Event(ORDER_ALERTS_VERIFIED_SESSION_EVENT));
  } catch {
    /* ignore */
  }
}

export function isOrderAlertsVerifiedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ORDER_ALERTS_VERIFIED_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function onOrderAlertsVerifiedSessionChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(ORDER_ALERTS_VERIFIED_SESSION_EVENT, listener);
  return () => window.removeEventListener(ORDER_ALERTS_VERIFIED_SESSION_EVENT, listener);
}

export function onOrderAlertsEnabledChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(ORDER_ALERTS_ENABLED_EVENT, listener);
  return () => window.removeEventListener(ORDER_ALERTS_ENABLED_EVENT, listener);
}

export function unlockAudio(): void {
  if (typeof window === "undefined" || unlockListenersAttached) return;
  unlockListenersAttached = true;

  const unlock = () => {
    void (async () => {
      await ensureAudioLoaded();
      if (ringActive) {
        const ok = await startOrderRing();
        if (ok) markOrderAlertsEnabled();
      }
    })();
  };

  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  window.addEventListener("touchstart", unlock, true);
}

/** Must be called from a button click — plays ~3s of the ringtone as proof. */
export async function enableOrderAlerts(): Promise<boolean> {
  const loaded = await ensureAudioLoaded();
  if (!loaded) return false;

  const ok = await playRing(true);
  if (!ok) return false;

  markOrderAlertsEnabled();

  window.setTimeout(() => {
    if (!ringActive && ringAudio) {
      ringAudio.pause();
      ringAudio.currentTime = 0;
    }
  }, 3000);

  return true;
}

export function playChime(): void {
  if (!isOrderAlertsEnabled() || ringActive) return;
  void playRing(false).then((ok) => {
    if (!ok) return;
    window.setTimeout(() => {
      if (!ringActive && ringAudio) {
        ringAudio.pause();
        ringAudio.currentTime = 0;
      }
    }, 3000);
  });
}

export async function tryStartOrderRing(): Promise<boolean> {
  return startOrderRing();
}

export async function startOrderRing(): Promise<boolean> {
  ringActive = true;
  return playRing(true);
}

export function stopOrderRing(): void {
  ringActive = false;
  if (ringAudio) {
    ringAudio.pause();
    ringAudio.currentTime = 0;
    ringAudio.loop = false;
  }
}

export function ensureOrderRingPlaying(): void {
  if (!ringActive) return;
  const audio = createRingAudio();
  if (!audio || !audio.paused) return;
  audio.loop = true;
  audio.volume = 1;
  void ensureAudioLoaded().then((loaded) => {
    if (!loaded || !ringActive || !ringAudio) return;
    void ringAudio.play().catch((error) => logAudio("keep-alive play failed", error));
  });
}

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
