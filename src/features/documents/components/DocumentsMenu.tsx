"use client";

import { useState } from "react";
import { FileText, MoreHorizontal, ChefHat, Truck, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableActionsMenu } from "@/components/ui/table-actions-menu";
import { cn } from "@/lib/utils";
import { useDocumentPreview } from "../context/DocumentPreviewContext";
import type { DocumentType } from "../types/document";

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
    >
      <Icon className="h-4 w-4 text-gray-500" />
      {label}
    </button>
  );
}

export function DocumentsMenu({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const { openDocument } = useDocumentPreview();

  const pick = (type: DocumentType) => {
    setOpen(false);
    openDocument(orderId, type);
  };

  return (
    <TableActionsMenu
      isOpen={open}
      onClose={() => setOpen(false)}
      onToggle={() => setOpen((v) => !v)}
      menuWidth={220}
      trigger={
        <Button variant="ghost" size="icon" title="Documents">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
    >
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
        Documents
      </div>
      <MenuItem icon={Receipt} label="Customer Invoice" onClick={() => pick("INVOICE")} />
      <MenuItem icon={ChefHat} label="Kitchen Ticket" onClick={() => pick("KITCHEN_TICKET")} />
      <MenuItem icon={Truck} label="Delivery Label" onClick={() => pick("DELIVERY_LABEL")} />
    </TableActionsMenu>
  );
}

export function DocumentQuickAction({
  orderId,
  documentType,
  label,
  icon: Icon = FileText,
  variant = "outline",
  size = "sm",
  className,
}: {
  orderId: string;
  documentType: DocumentType;
  label: string;
  icon?: React.ElementType;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "sm" | "default";
  className?: string;
}) {
  const { openDocument } = useDocumentPreview();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-1", className)}
      onClick={(e) => {
        e.stopPropagation();
        openDocument(orderId, documentType);
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
