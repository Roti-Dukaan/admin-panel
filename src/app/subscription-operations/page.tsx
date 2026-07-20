"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OpsDashboardTab } from "@/features/subscriptions/components/ops/OpsDashboardTab";
import { OpsForecastTab } from "@/features/subscriptions/components/ops/OpsForecastTab";
import { OpsCalendarTab } from "@/features/subscriptions/components/ops/OpsCalendarTab";
import { OpsReportsTab } from "@/features/subscriptions/components/ops/OpsReportsTab";
import { OpsAnalyticsTab } from "@/features/subscriptions/components/ops/OpsAnalyticsTab";
import { AlertsTab } from "@/features/subscriptions/components/ops/AlertBanner";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useOpsRealtime } from "@/features/subscriptions/hooks/useSubscriptions";

export default function SubscriptionOperationsPage() {
  const user = useAdminAuthStore((s) => s.user);
  const roles: string[] = user?.roles ?? [];
  const isFullAccess = roles.includes("ADMIN") || roles.includes("OWNER");
  useOpsRealtime();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription Operations</h1>
        <p className="text-sm text-muted-foreground">
          Production, delivery, renewal and revenue visibility for recurring subscriptions.
          {!isFullAccess && " (Read-only — Moderator)"}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="dashboard"><OpsDashboardTab /></TabsContent>
          <TabsContent value="forecast"><OpsForecastTab /></TabsContent>
          <TabsContent value="calendar"><OpsCalendarTab /></TabsContent>
          <TabsContent value="analytics"><OpsAnalyticsTab /></TabsContent>
          <TabsContent value="reports">
            {isFullAccess ? <OpsReportsTab /> : <ReadOnlyNote />}
          </TabsContent>
          <TabsContent value="alerts">
            {isFullAccess ? <AlertsTab /> : <ReadOnlyNote />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ReadOnlyNote() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700">
      Read-only access. Export and alert management require Admin or Owner role.
    </div>
  );
}
