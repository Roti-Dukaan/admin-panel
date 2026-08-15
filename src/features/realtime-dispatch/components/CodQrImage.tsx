"use client";

import QRCode from "react-qr-code";

type CodQrImageProps = {
  /** UPI deep link from Razorpay image_content (preferred). */
  content?: string | null;
  /** Branded Razorpay card URL — fallback when image_content unavailable. */
  fallbackSrc?: string | null;
  size?: number;
  className?: string;
};

export function CodQrImage({
  content,
  fallbackSrc,
  size = 280,
  className = "",
}: CodQrImageProps) {
  if (content) {
    const qrSize = size - 32;
    return (
      <div
        className={`mx-auto rounded-2xl border-2 border-gray-200 bg-white p-4 ${className}`}
        style={{ width: size }}
      >
        <QRCode value={content} size={qrSize} level="M" bgColor="#ffffff" fgColor="#000000" />
      </div>
    );
  }

  if (fallbackSrc) {
    return (
      <div
        className={`mx-auto overflow-hidden rounded-2xl border-2 border-gray-200 bg-white ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={fallbackSrc}
          alt="UPI QR code"
          draggable={false}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return null;
}
