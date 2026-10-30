/** Proxy private S3 support images through the backend media endpoint. */
export function supportAttachmentImageSrc(url: string): string {
  if (!url) return "";
  if (url.includes("/media/image?")) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  if (!base) return url;
  return `${base}/media/image?url=${encodeURIComponent(url)}`;
}

export function isImageAttachment(fileType?: string, url?: string): boolean {
  const type = (fileType ?? "").toLowerCase();
  if (type.startsWith("image/")) return true;
  const lower = (url ?? "").toLowerCase();
  return /\.(jpe?g|png|webp|gif)(\?|$)/.test(lower);
}
