"use client";

import { useRef } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

const BULLET_PREFIX = "• ";

function getLineStart(text: string, cursor: number) {
  const before = text.slice(0, cursor);
  return before.lastIndexOf("\n") + 1;
}

function getLineEnd(text: string, cursor: number) {
  const after = text.slice(cursor);
  const nextNewline = after.indexOf("\n");
  return nextNewline === -1 ? text.length : cursor + nextNewline;
}

function lineHasBullet(line: string) {
  return /^[-*•]\s/.test(line);
}

type DescriptionBulletTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  rows?: number;
  placeholder?: string;
};

export function DescriptionBulletTextarea({
  value,
  onChange,
  disabled,
  className,
  rows = 4,
  placeholder,
}: DescriptionBulletTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const insertBulletAtCursor = () => {
    const el = ref.current;
    if (!el || disabled) return;

    const start = el.selectionStart;
    const lineStart = getLineStart(value, start);
    const lineEnd = getLineEnd(value, start);
    const line = value.slice(lineStart, lineEnd);

    if (lineHasBullet(line)) return;

    const nextValue = `${value.slice(0, lineStart)}${BULLET_PREFIX}${value.slice(lineStart)}`;
    const nextCursor = start + BULLET_PREFIX.length;

    onChange(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled || e.key !== "Enter" || e.shiftKey) return;

    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const lineStart = getLineStart(value, start);
    const line = value.slice(lineStart, getLineEnd(value, start));

    if (!lineHasBullet(line)) return;

    e.preventDefault();
    const nextValue = `${value.slice(0, start)}\n${BULLET_PREFIX}${value.slice(start)}`;
    const nextCursor = start + 1 + BULLET_PREFIX.length;

    onChange(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          Start lines with • for bullet points. Press Enter to continue the list.
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={insertBulletAtCursor}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <List className="h-3.5 w-3.5" />
          Add bullet
        </button>
      </div>
      <textarea
        ref={ref}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={
          placeholder ??
          "Short intro about the plan...\n• First benefit\n• Second benefit"
        }
        className={cn("w-full rounded-xl border border-gray-200 px-3 py-2.5", className)}
      />
    </div>
  );
}
