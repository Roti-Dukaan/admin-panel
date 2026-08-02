"use client";

import * as React from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dispatchRoutesApi } from "../services/dispatch-routes.api";

export function RouteSheetPrint({
  routeId,
  label = "Print Route Sheet",
}: {
  routeId: string;
  label?: string;
}) {
  const [busy, setBusy] = React.useState(false);

  const handlePrint = async () => {
    setBusy(true);
    try {
      const html = await dispatchRoutesApi.routeSheetHtml(routeId);
      const win = window.open("", "_blank", "noopener,noreferrer");
      if (!win) {
        toast.error("Could not open print window");
        return;
      }
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    } catch {
      toast.error("Could not load route sheet");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={handlePrint}>
      <Printer className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}
