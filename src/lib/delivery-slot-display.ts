/** Format "HH:MM" or "HH:MM:SS" as "6:00 AM". */
export function formatDeliverySlotTime(time: string): string {
  const [hRaw, mRaw] = time.split(":");
  const h = parseInt(hRaw, 10);
  const m = parseInt(mRaw ?? "0", 10);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** e.g. 06:00 + 07:00 → "6:00 AM – 7:00 AM" */
export function formatDeliverySlotLabel(startTime: string, endTime: string): string {
  return `${formatDeliverySlotTime(startTime)} – ${formatDeliverySlotTime(endTime)}`;
}

/** Format a stored slot window such as "06:00-08:00" for display. */
export function formatDeliverySlotWindow(window: string): string {
  const match = window.match(
    /^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:-|–|—|to)\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*$/i,
  );
  return match ? formatDeliverySlotLabel(match[1], match[2]) : window;
}

export type Time12Parts = {
  hour: number;
  minute: number;
  period: "AM" | "PM";
};

export function parseTime24To12(time: string): Time12Parts | null {
  const [hRaw, mRaw] = time.split(":");
  const h24 = parseInt(hRaw, 10);
  const minute = parseInt(mRaw ?? "0", 10);
  if (Number.isNaN(h24) || Number.isNaN(minute)) return null;
  return {
    hour: h24 % 12 === 0 ? 12 : h24 % 12,
    minute,
    period: h24 >= 12 ? "PM" : "AM",
  };
}

export function format12PartsTo24(parts: Time12Parts): string {
  let h24 = parts.hour % 12;
  if (parts.period === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
export const MINUTES = Array.from({ length: 60 }, (_, i) => i);
export const PERIODS: Array<"AM" | "PM"> = ["AM", "PM"];
