import { Check, Loader2, Bike, MapPin, PackageCheck, Truck, Home, AlertCircle } from "lucide-react";
import type { DeliveryStatus, DeliveryTimelineEntry } from "@/features/delivery/types/delivery";
import { formatIstDateTime } from "@/lib/date";

interface DeliveryTimelineProps {
  entries: DeliveryTimelineEntry[];
  currentStatus: DeliveryStatus;
  className?: string;
}

const STEP_ICON: Record<string, React.ReactNode> = {
  WAITING_FOR_KITCHEN: <PackageCheck className="h-4 w-4" />,
  WAITING_FOR_PROVIDER: <Loader2 className="h-4 w-4" />,
  PROVIDER_ASSIGNMENT_FAILED: <AlertCircle className="h-4 w-4" />,
  PROVIDER_ASSIGNED: <Bike className="h-4 w-4" />,
  RIDER_ARRIVING: <MapPin className="h-4 w-4" />,
  RIDER_ARRIVED: <MapPin className="h-4 w-4" />,
  AWAITING_PICKUP: <MapPin className="h-4 w-4" />,
  PICKED_UP: <Bike className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
  DELIVERED: <Home className="h-4 w-4" />,
  FAILED: <AlertCircle className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
};

export function DeliveryTimeline({ entries, currentStatus, className }: DeliveryTimelineProps) {
  if (!entries.length) {
    return <p className="py-6 text-center text-sm text-gray-400">No delivery events yet.</p>;
  }

  const currentIndex = entries.findIndex((e) => e.status === currentStatus);

  return (
    <ol className={className}>
      {entries.map((entry, index) => {
        const isCompleted = index < currentIndex || entry.status === "DELIVERED";
        const isCurrent = index === currentIndex && entry.status !== "DELIVERED";
        const Icon = STEP_ICON[entry.status] ?? <Loader2 className="h-4 w-4" />;
        const title = entry.title ?? entry.label ?? entry.status;

        return (
          <li key={entry.id ?? index} className="relative flex gap-3 pb-6 last:pb-0">
            {index < entries.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${
                  isCompleted ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isCurrent
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : Icon}
            </span>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-indigo-700" : isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {title}
                </p>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatIstDateTime(entry.timestamp, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              {(entry.description || entry.label) && (
                <p className="mt-0.5 text-sm text-gray-500">{entry.description ?? entry.label}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
