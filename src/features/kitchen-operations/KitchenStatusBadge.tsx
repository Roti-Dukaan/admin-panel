import { Badge } from "@/components/ui/badge";
import { KitchenStatusValue } from "@/lib/api/kitchen.api";

const STATUS_CONFIG: Record<
  KitchenStatusValue,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary"; dot: string }
> = {
  OPEN: { label: "Open", variant: "success", dot: "bg-emerald-500" },
  BUSY: { label: "Busy", variant: "warning", dot: "bg-amber-500" },
  CLOSED: { label: "Closed", variant: "destructive", dot: "bg-red-500" },
  MAINTENANCE: { label: "Maintenance", variant: "secondary", dot: "bg-gray-500" },
};

export function KitchenStatusBadge({ status }: { status: KitchenStatusValue }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG as KITCHEN_STATUS_CONFIG };
