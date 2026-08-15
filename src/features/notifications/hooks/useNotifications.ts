"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { notificationsApi } from "../services/notifications.api";
import type { CreateNotificationInput, PushNotification } from "../types/notification";

export function useNotifications() {
  const [items, setItems] = useState<PushNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async (nextPage = page) => {
    setLoading(true);
    try {
      const result = await notificationsApi.list(nextPage);
      setItems(result.items);
      setTotal(result.total);
      setPage(nextPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const create = async (input: CreateNotificationInput) => {
    const created = await notificationsApi.create(input);
    toast.success(input.sendNow ? "Notification sent" : "Notification saved");
    await load(1);
    return created;
  };

  const send = async (id: string) => {
    await notificationsApi.send(id);
    toast.success("Notification sent");
    await load(page);
  };

  const cancel = async (id: string) => {
    await notificationsApi.cancel(id);
    toast.success("Notification cancelled");
    await load(page);
  };

  return { items, total, loading, page, load, create, send, cancel };
}
