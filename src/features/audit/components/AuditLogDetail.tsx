"use client";

import { format } from "date-fns";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { AuditLog } from "../types/audit";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

interface AuditLogDetailProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function JsonDiff({ oldValues, newValues }: { oldValues: Record<string, unknown> | null; newValues: Record<string, unknown> | null }) {
  if (!oldValues && !newValues) return <p className="text-sm text-gray-500">No changes recorded</p>;

  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  if (allKeys.size === 0) return <p className="text-sm text-gray-500">No changes recorded</p>;

  return (
    <div className="space-y-2">
      {Array.from(allKeys).sort().map((key) => {
        const oldVal = oldValues?.[key];
        const newVal = newValues?.[key];
        const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

        return (
          <div key={key} className={`rounded-lg border p-3 text-sm ${isChanged ? "border-amber-200 bg-amber-50/50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-700">{key}</span>
              {isChanged && <span className="text-[10px] font-medium text-amber-600 uppercase">changed</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-medium">Before</span>
                <p className="text-xs text-gray-600 font-mono break-all">{oldVal !== undefined ? JSON.stringify(oldVal) : "—"}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-medium">After</span>
                <p className="text-xs text-gray-600 font-mono break-all">{newVal !== undefined ? JSON.stringify(newVal) : "—"}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AuditLogDetail({ log, isOpen, onClose }: AuditLogDetailProps) {
  if (!log) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerHeader className="border-b">
        <div className="flex items-center justify-between w-full">
          <DrawerTitle>Audit Log Detail</DrawerTitle>
          <DrawerClose onClick={onClose} />
        </div>
      </DrawerHeader>

      <DrawerContent>
        <div className="space-y-6">
          {/* Metadata */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Event Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Timestamp</span>
                <span className="font-medium">{format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Admin</span>
                <span className="font-medium">{log.admin.name || log.admin.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Action</span>
                <span className="font-medium px-2 py-0.5 rounded-full text-xs bg-gray-100">{log.action}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Entity</span>
                <span className="font-medium">{log.entity}</span>
              </div>
              {log.entityId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Entity ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs">{log.entityId}</span>
                    <CopyButton text={log.entityId} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Request Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Request Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">IP Address</span>
                <span className="font-mono text-xs">{log.ipAddress ?? "—"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500">User Agent</span>
                <span className="text-xs text-gray-600 text-right max-w-[250px] break-all">{log.userAgent ?? "—"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Changes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Changes</h4>
            <JsonDiff oldValues={log.oldValues} newValues={log.newValues} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
