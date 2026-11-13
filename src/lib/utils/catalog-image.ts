import { API_BASE_URL } from "@/lib/env";

const CDN_HOST =
  /(?:cloudfront\.net|\.s3\.(?:ap-south-1|ap-south-2)\.amazonaws\.com)/i;

export function isCatalogCdnUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return CDN_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function resolveCatalogImageUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
