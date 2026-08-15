"use client";

import { NotificationEditor } from "./NotificationEditor";
import { NotificationsTable } from "./NotificationsTable";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsSection() {
  const { items, loading, create, send, cancel } = useNotifications();

  return (
    <div className="space-y-6">
      <NotificationEditor onSubmit={create} />
      <NotificationsTable items={items} loading={loading} onSend={send} onCancel={cancel} />
    </div>
  );
}
