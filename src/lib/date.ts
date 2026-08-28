// Lightweight IST date helpers (matches backend ist-date.util).

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const IST_TIME_ZONE = "Asia/Kolkata";

export type DateValue = Date | string | number;

function dateForDisplay(value: DateValue): Date {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+05:30`);
  }
  return value instanceof Date ? value : new Date(value);
}

/** Format an instant in IST. Date-only keys remain on their stated calendar day. */
export function formatInIst(
  value: DateValue,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = dateForDisplay(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: IST_TIME_ZONE,
  })
    .format(date)
    .replace(/\b(am|pm)\b/gi, (period) => period.toUpperCase());
}

export function formatIstDate(
  value: DateValue,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  return formatInIst(value, options);
}

export function formatIstTime(value: DateValue, includeSeconds = false): string {
  return formatInIst(value, {
    hour: "numeric",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: true,
  });
}

export function formatIstDateTime(
  value: DateValue,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
): string {
  return formatInIst(value, options);
}

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
