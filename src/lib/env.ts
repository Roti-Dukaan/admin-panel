/**
 * Backend API origin (no trailing slash).
 * Local dev falls back to localhost; deployed builds must set NEXT_PUBLIC_API_URL.
 */
function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }

  return '';
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Dev/staging admin login: show OTP returned by the API on the verify screen. */
export function isDevOtpVisible(): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_DEV_OTP === 'true') return true;
  const api = API_BASE_URL.toLowerCase();
  return api.includes('localhost') || api.includes('127.0.0.1') || api.includes('backend-dev');
}
