/** When this browser tab began monitoring kitchen alerts (survives auth/socket delay). */
const ALERT_SESSION_START_KEY = "roti-order-alert-session-start";

export function markAlertSessionStart(): void {
  if (typeof window === "undefined") return;
  try {
    if (!sessionStorage.getItem(ALERT_SESSION_START_KEY)) {
      sessionStorage.setItem(ALERT_SESSION_START_KEY, String(Date.now()));
    }
  } catch {
    /* ignore */
  }
}

export function getAlertSessionStart(): number {
  if (typeof window === "undefined") return Date.now();
  try {
    const raw = sessionStorage.getItem(ALERT_SESSION_START_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return Date.now();
}
