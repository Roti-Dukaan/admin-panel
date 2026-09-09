"use client";

import { useEffect, useRef } from "react";

interface BannerLottiePreviewProps {
  src: string;
  className?: string;
}

export function BannerLottiePreview({ src, className }: BannerLottiePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!src || !containerRef.current) return;

    let cancelled = false;

    void import("lottie-web").then((lottieModule) => {
      if (cancelled || !containerRef.current) return;

      animationRef.current?.destroy();
      animationRef.current = lottieModule.default.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: src,
      });
    });

    return () => {
      cancelled = true;
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-28 w-full overflow-hidden rounded-lg border border-gray-200 bg-white"}
    />
  );
}
