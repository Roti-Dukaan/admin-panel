"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PushNotification } from "../types/notification";

interface NotificationsTableProps {
  items: PushNotification[];
  loading: boolean;
  onSend: (id: string) => void;
  onCancel: (id: string) => void;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  SCHEDULED: "outline",
  SENT: "default",
  PARTIALLY_SENT: "outline",
  FAILED: "destructive",
  CANCELLED: "secondary",
  SENDING: "outline",
};

export function NotificationsTable({ items, loading, onSend, onCancel }: NotificationsTableProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground p-4">Loading notifications…</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">No notifications yet.</p>;
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{item.body}</div>
              </TableCell>
              <TableCell className="text-xs">{item.type}</TableCell>
              <TableCell className="text-xs">{item.targetType.replace(/_/g, " ")}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[item.status] ?? "secondary"}>{item.status}</Badge>
              </TableCell>
              <TableCell className="text-xs">
                {item.sentAt ? new Date(item.sentAt).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {(item.status === "DRAFT" || item.status === "SCHEDULED") && (
                  <>
                    <Button size="sm" onClick={() => onSend(item.id)}>Send</Button>
                    <Button size="sm" variant="outline" onClick={() => onCancel(item.id)}>Cancel</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
