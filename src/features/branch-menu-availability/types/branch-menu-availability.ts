import type { BranchMenuAvailabilityItem, BranchMenuSummary } from '@/lib/api/branch-menu-availability.api';

export type { BranchMenuAvailabilityItem, BranchMenuSummary };

export const AVAILABILITY_STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
  DISABLED: { label: 'Disabled', color: 'text-gray-600', bg: 'bg-gray-50', dot: 'bg-gray-400' },
} as const;

export type AvailabilityStatus = keyof typeof AVAILABILITY_STATUS_CONFIG;
