"use client";

import { HEALTH_TAG_CONFIG, HealthTag } from "../types/menu";

interface HealthTagSelectorProps {
  selected: HealthTag[];
  onChange: (tags: HealthTag[]) => void;
}

export function HealthTagSelector({ selected, onChange }: HealthTagSelectorProps) {
  const toggle = (tag: HealthTag) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.entries(HEALTH_TAG_CONFIG) as [HealthTag, { label: string; emoji: string }][]).map(([key, config]) => {
        const isSelected = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              isSelected
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span>{config.emoji}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
