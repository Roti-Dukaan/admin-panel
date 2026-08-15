"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreateNotificationInput, TargetType } from "../types/notification";
import { NOTIFICATION_TYPE_OPTIONS, TARGET_TYPE_OPTIONS } from "../types/notification";

interface NotificationEditorProps {
  onSubmit: (input: CreateNotificationInput) => Promise<void>;
}

export function NotificationEditor({ onSubmit }: NotificationEditorProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("promotion");
  const [targetType, setTargetType] = useState<TargetType>("all_customers");
  const [targetBranchId, setTargetBranchId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [route, setRoute] = useState("");
  const [entityId, setEntityId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        body: body.trim(),
        targetType,
        route: route.trim() || undefined,
        entityId: entityId.trim() || undefined,
        entityType: entityId.trim() ? "order" : undefined,
        targetBranchId: targetBranchId.trim() || undefined,
        targetRole: targetRole.trim() || undefined,
        targetUserId: targetUserId.trim() || undefined,
        scheduledAt: !sendNow && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        sendNow,
      });
      setTitle("");
      setBody("");
      setRoute("");
      setEntityId("");
      setScheduledAt("");
    } finally {
      setSubmitting(false);
    }
  };

  const needsBranch = ["branch", "branch_managers"].includes(targetType);
  const needsRole = targetType === "role";
  const needsUser = targetType === "specific_users";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create notification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} required rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target audience</Label>
            <Select value={targetType} onValueChange={(v) => setTargetType(v as TargetType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TARGET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsBranch && (
            <div className="space-y-2">
              <Label htmlFor="branchId">Branch ID</Label>
              <Input id="branchId" value={targetBranchId} onChange={(e) => setTargetBranchId(e.target.value)} />
            </div>
          )}

          {needsRole && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="branch_manager" />
            </div>
          )}

          {needsUser && (
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="route">Deep link route</Label>
            <Input id="route" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="/orders/abc123" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityId">Entity ID (optional)</Label>
            <Input id="entityId" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={sendNow} onCheckedChange={setSendNow} id="sendNow" />
            <Label htmlFor="sendNow">Send immediately</Label>
          </div>

          {!sendNow && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="scheduledAt">Schedule for</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required={!sendNow}
              />
            </div>
          )}

          <div className="md:col-span-2 rounded-lg border bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <div className="flex gap-3 items-start">
              <div className="h-10 w-10 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">RD</div>
              <div>
                <p className="font-medium text-sm">{title || "Notification title"}</p>
                <p className="text-sm text-muted-foreground">{body || "Notification message"}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : sendNow ? "Send notification" : "Schedule notification"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
