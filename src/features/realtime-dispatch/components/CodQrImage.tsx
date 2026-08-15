"use client";

type CodQrImageProps = {
  src: string;
  size?: number;
  className?: string;
};

/** Razorpay image_url is a full payment card — crop to the QR matrix only. */
export function CodQrImage({ src, size = 280, className = "" }: CodQrImageProps) {
  const zoom = 2.35;

  return (
    <div
      className={`mx-auto overflow-hidden rounded-2xl border-2 border-gray-200 bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="UPI QR code"
        draggable={false}
        className="pointer-events-none max-w-none select-none"
        style={{
          display: "block",
          width: size * zoom,
          height: "auto",
          marginLeft: "50%",
          transform: "translateX(-50%) translateY(-38%)",
        }}
      />
    </div>
  );
}
