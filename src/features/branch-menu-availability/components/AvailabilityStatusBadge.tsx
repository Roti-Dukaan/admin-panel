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

export function StatusSelect({
  value,
  onChange,
  className,
  excludeStatuses,
}: {
  value: AvailabilityStatus;
  onChange: (v: AvailabilityStatus) => void;
  className?: string;
  excludeStatuses?: AvailabilityStatus[];
}) {
  const excluded = new Set(excludeStatuses ?? []);
  const options = Object.entries(AVAILABILITY_STATUS_CONFIG).filter(
    ([key]) => !excluded.has(key as AvailabilityStatus),
  );

  const showCurrentAsDisabled = excluded.has(value) && !options.some(([key]) => key === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AvailabilityStatus)}
      className={cn('rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100', className)}
    >
      {showCurrentAsDisabled && (
        <option value={value} disabled>
          {AVAILABILITY_STATUS_CONFIG[value].label}
        </option>
      )}
      {options.map(([key, config]) => (
        <option key={key} value={key}>{config.label}</option>
      ))}
    </select>
  );
}
