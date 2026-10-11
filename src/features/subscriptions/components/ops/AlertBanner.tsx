"use client";

import { useOpsAlerts, useDetectOpsAlerts, useResolveOpsAlert } from "@/features/subscriptions/hooks/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { formatIstDateTime } from "@/lib/date";

function severityVariant(s: string) {
  if (s === "CRITICAL") return "destructive" as const;
  if (s === "WARNING") return "warning" as const;
  return "secondary" as const;
}

export function AlertBanner() {
  const { data, isLoading } = useOpsAlerts(false);
  const detect = useDetectOpsAlerts();
  const [open, setOpen] = useState(false);

  const unresolved = (data ?? []).filter((a) => !a.isResolved);
  if (unresolved.length === 0 && !open) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-amber-800">
          {unresolved.length} active operational alert{unresolved.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide" : "View"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => detect.mutate()} disabled={detect.isPending}>
            {detect.isPending ? <Loader2 className="size-4 animate-spin" /> : "Run Scan"}
          </Button>
        </div>
      </div>
      {open && (
        <div className="mt-2 space-y-1.5">
          {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {unresolved.map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AlertRow({ alert }: { alert: any }) {
  const resolve = useResolveOpsAlert();
  return (
    <div className="flex items-start justify-between rounded-lg bg-white/70 px-3 py-2">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
          <span className="text-sm font-medium text-foreground">{alert.title}</span>
        </div>
        <p className="text-xs text-muted-foreground">{alert.message}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={() => resolve.mutate(alert.id)}>
        Resolve
      </Button>
    </div>
  );
}

export function AlertsTab() {
  const { data, isLoading } = useOpsAlerts();
  const detect = useDetectOpsAlerts();
  if (isLoading) return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>;
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => detect.mutate()} disabled={detect.isPending}>
          {detect.isPending ? <Loader2 className="size-4 animate-spin" /> : "Run Detection Scan"}
        </Button>
      </div>
      {(data ?? []).length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No alerts.</p>
      ) : (
        <div className="space-y-2">
          {data!.map((a) => (
            <div key={a.id} className={`rounded-lg border px-3 py-2 ${a.isResolved ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={severityVariant(a.severity)}>{a.severity}</Badge>
                  <span className="text-sm font-medium">{a.title}</span>
                  {a.isResolved && <Badge variant="secondary">Resolved</Badge>}
                </div>
                {!a.isResolved && <ResolveButton id={a.id} />}
              </div>
              <p className="text-xs text-muted-foreground">{a.message}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatIstDateTime(a.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResolveButton({ id }: { id: string }) {
  const resolve = useResolveOpsAlert();
  return (
    <Button size="sm" variant="ghost" onClick={() => resolve.mutate(id)}>
      Resolve
    </Button>
  );
}
