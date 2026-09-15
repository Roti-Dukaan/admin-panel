"use client";

/** Animated “…” bubble shown while the other party is typing. */
export function SupportTypingIndicator({
  label,
  align = "left",
}: {
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`inline-flex max-w-[85%] items-center gap-2 rounded-2xl px-4 py-2.5 text-sm text-gray-600 shadow-sm ${
          align === "right" ? "bg-orange-50" : "bg-gray-100"
        }`}
        aria-live="polite"
        aria-label={label}
      >
        <span className="font-medium text-gray-700">{label}</span>
        <span className="inline-flex items-end gap-0.5 pb-0.5" aria-hidden>
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: "0.9s" }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
