"use client";

import { useMenuStore } from "../hooks/useMenu";
import { AVAILABILITY_CONFIG, Availability } from "../types/menu";

export function CategoryBadge({ category }: { category: string }) {
  const getCategoryByName = useMenuStore((s) => s.getCategoryByName);
  const cat = getCategoryByName(category);

  if (!cat) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-600">
        {category}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cat.bgColor} ${cat.color}`}>
      <span>{cat.emoji}</span>
      {cat.name}
    </span>
  );
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const config = AVAILABILITY_CONFIG[availability];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bgColor} ${config.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
