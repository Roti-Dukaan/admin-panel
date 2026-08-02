"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyTextButton({
  text,
  label = "Copied!",
  className,
  title = "Copy",
}: {
  text: string;
  label?: string;
  className?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center rounded border border-gray-200 bg-white p-0.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors",
        className,
      )}
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}
