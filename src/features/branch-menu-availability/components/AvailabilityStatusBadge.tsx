import { AVAILABILITY_STATUS_CONFIG, type AvailabilityStatus } from '../types/branch-menu-availability';
import { cn } from '@/lib/utils';

export function AvailabilityStatusBadge({ status, className }: { status: AvailabilityStatus; className?: string }) {
  const config = AVAILABILITY_STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function StatusSelect({ value, onChange, className }: { value: AvailabilityStatus; onChange: (v: AvailabilityStatus) => void; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AvailabilityStatus)}
      className={cn('rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100', className)}
    >
      {Object.entries(AVAILABILITY_STATUS_CONFIG).map(([key, config]) => (
        <option key={key} value={key}>{config.label}</option>
      ))}
    </select>
  );
}
