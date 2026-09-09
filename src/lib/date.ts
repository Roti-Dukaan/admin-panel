// Lightweight IST date helpers (matches backend ist-date.util).

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** YYYY-MM-DD in IST. */
export function toDateKey(date: Date = new Date()): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIst(date: Date, days: number): string {
  const start = new Date(date.getTime() + IST_OFFSET_MS);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + days);
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, "0");
  const d = String(start.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayDateKey(): string {
  return toDateKey(new Date());
}

export function tomorrowDateKey(): string {
  return addDaysIst(new Date(), 1);
}

export function startOfMonthDateKey(): string {
  const today = todayDateKey();
  return `${today.slice(0, 7)}-01`;
}

/** date-fns format tokens — 12-hour clock with AM/PM */
export const FNS_DATE_TIME = "MMM d, h:mm a";
export const FNS_DATE_TIME_YEAR = "MMM d, yyyy h:mm a";
export const FNS_DATE_TIME_SECONDS = "MMM d, h:mm:ss a";
export const FNS_DATE_TIME_YEAR_SECONDS = "MMM d, yyyy h:mm:ss a";
export const FNS_TIME = "h:mm a";
