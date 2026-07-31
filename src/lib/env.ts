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
