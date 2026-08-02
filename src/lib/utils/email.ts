/** Normalize email for display, login, and API payloads. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
