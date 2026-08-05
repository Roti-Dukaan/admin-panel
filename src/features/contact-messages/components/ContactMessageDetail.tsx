"use client";

import { format } from "date-fns";
import type { ContactMessage, ContactMessageStatus } from "../types/contact-message";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface ContactMessageDetailProps {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: ContactMessageStatus) => Promise<void>;
  updating?: boolean;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 mt-1 break-words">{value || "—"}</p>
    </div>
  );
}

export function ContactMessageDetail({
  message,
  isOpen,
  onClose,
  onStatusChange,
  updating = false,
}: ContactMessageDetailProps) {
  if (!message) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerHeader className="border-b">
        <div className="flex items-center justify-between w-full">
          <DrawerTitle>Contact Message</DrawerTitle>
          <DrawerClose onClick={onClose} />
        </div>
      </DrawerHeader>
      <DrawerContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Name" value={message.name} />
          <DetailRow label="Email" value={message.email} />
          <DetailRow label="Phone" value={message.phone} />
          <DetailRow label="Status" value={message.status} />
          <DetailRow label="Received" value={format(new Date(message.createdAt), "PPpp")} />
          <DetailRow label="IP Address" value={message.ipAddress} />
        </div>

        <Separator />

        <DetailRow label="Subject" value={message.subject} />

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Message</p>
          <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap leading-relaxed">
            {message.message}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {message.status !== "READ" && (
            <Button
              variant="outline"
              disabled={updating}
              onClick={() => onStatusChange(message.id, "READ")}
            >
              Mark as Read
            </Button>
          )}
          {message.status !== "ARCHIVED" && (
            <Button
              variant="outline"
              disabled={updating}
              onClick={() => onStatusChange(message.id, "ARCHIVED")}
            >
              Archive
            </Button>
          )}
          {message.status !== "NEW" && (
            <Button
              variant="outline"
              disabled={updating}
              onClick={() => onStatusChange(message.id, "NEW")}
            >
              Mark as New
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
