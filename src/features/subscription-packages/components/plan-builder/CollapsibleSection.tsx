"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  error?: string;
}

export function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
  error,
}: CollapsibleSectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{title}</h3>
          {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && <div className="border-t border-gray-100 px-4 py-4">{children}</div>}
    </section>
  );
}
