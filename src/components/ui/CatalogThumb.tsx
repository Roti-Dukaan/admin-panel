import { resolveCatalogImageUrl } from "@/lib/utils/catalog-image";
import { cn } from "@/lib/utils";

type CatalogThumbProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Eager load for hero previews only */
  priority?: boolean;
};

/** Small admin thumbnail — lazy load, direct CDN URL. */
export function CatalogThumb({
  src,
  alt,
  className,
  priority = false,
}: CatalogThumbProps) {
  const resolved = resolveCatalogImageUrl(src);
  if (!resolved) {
    return <div className={cn("bg-gray-100", className)} aria-hidden />;
  }
  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
    />
  );
}
