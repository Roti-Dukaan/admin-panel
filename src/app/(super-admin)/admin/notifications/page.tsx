"use client";

import { Header } from "@/components/layout/header";
import { NotificationsSection } from "@/features/notifications/components/NotificationsSection";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        <Header
          title="Notifications"
          subtitle="Create and manage push notifications for customers and staff."
          showSearch={false}
        />
        <NotificationsSection />
      </div>
    </div>
  );
}
