import { AlertTriangle, CheckCircle, Clock, Loader2, MinusCircle, SkipForward, XCircle } from 'lucide-react';
import { SubscriptionProductionStatus } from '../types/subscription-production';

export const PRODUCTION_STATUS_LABELS: Record<SubscriptionProductionStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  CANCELLED: 'Cancelled',
};

export const PRODUCTION_STATUS_COLORS: Record<SubscriptionProductionStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  SKIPPED: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export function ProductionStatusBadge({ status }: { status: SubscriptionProductionStatus }) {
  const config = PRODUCTION_STATUS_COLORS[status];
  const Icon = getStatusIcon(status);

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg} ${config.text} text-xs font-medium`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon className="h-3 w-3" />
      <span>{PRODUCTION_STATUS_LABELS[status]}</span>
    </div>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: SubscriptionProductionStatus;
  onChange: (status: SubscriptionProductionStatus) => void;
}) {
  const getStatusOptions = () => {
    return Object.entries(PRODUCTION_STATUS_LABELS).map(([status, label]) => ({
      value: status as SubscriptionProductionStatus,
      label,
      color: PRODUCTION_STATUS_COLORS[status as SubscriptionProductionStatus],
      icon: getStatusIcon(status as SubscriptionProductionStatus),
    }));
  };

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SubscriptionProductionStatus)}
        className="appearance-none inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
      >
        {getStatusOptions().map((option) => {
          const Icon = option.icon;
          return (
            <option
              key={option.value}
              value={option.value}
              className={`${option.color.text} ${option.color.bg}`}
            >
              <span className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {option.label}
              </span>
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function getStatusIcon(status: SubscriptionProductionStatus) {
  switch (status) {
    case 'PENDING':
      return AlertTriangle;
    case 'IN_PROGRESS':
      return Loader2;
    case 'COMPLETED':
      return CheckCircle;
    case 'SKIPPED':
      return SkipForward;
    case 'CANCELLED':
      return XCircle;
    default:
      return MinusCircle;
  }
}