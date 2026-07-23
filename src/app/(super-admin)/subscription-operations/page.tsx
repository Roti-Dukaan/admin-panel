"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, TrendingUp, CalendarDays, BarChart3, FileText, Bell } from "lucide-react";
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
          <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="forecast" className="gap-1.5"><TrendingUp className="h-4 w-4" />Forecast</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5"><CalendarDays className="h-4 w-4" />Calendar</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5"><FileText className="h-4 w-4" />Reports</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5"><Bell className="h-4 w-4" />Alerts</TabsTrigger>
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
