"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ onPrint, disabled }: { onPrint: () => void; disabled?: boolean }) {
  return (
    <Button type="button" variant="outline" onClick={onPrint} disabled={disabled} className="gap-2">
      <Printer className="h-4 w-4" />
      Print
    </Button>
  );
}
