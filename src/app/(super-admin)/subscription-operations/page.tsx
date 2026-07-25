"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, TrendingUp, CalendarDays, BarChart3, FileText, Bell } from "lucide-react";
import { OpsDashboardTab } from "@/features/subscriptions/components/ops/OpsDashboardTab";
import { OpsForecastTab } from "@/features/subscriptions/components/ops/OpsForecastTab";
import { OpsCalendarTab } from "@/features/subscriptions/components/ops/OpsCalendarTab";
import { OpsReportsTab } from "@/features/subscriptions/components/ops/OpsReportsTab";
import { OpsAnalyticsTab } from "@/features/subscriptions/components/ops/OpsAnalyticsTab";
import { AlertsTab } from "@/features/subscriptions/components/ops/AlertBanner";
import { BranchSelector } from "@/features/subscriptions/components/ops/BranchSelector";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { useOpsRealtime } from "@/features/subscriptions/hooks/useSubscriptions";

const TAB_ITEMS = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "forecast", label: "Forecast", icon: TrendingUp },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "reports", label: "Reports", icon: FileText },
  { value: "alerts", label: "Alerts", icon: Bell },
] as const;

export default function SubscriptionOperationsPage() {
  const user = useAdminAuthStore((s) => s.user);
  const roles: string[] = user?.roles ?? [];
  const isFullAccess = roles.includes("ADMIN") || roles.includes("OWNER");
  useOpsRealtime();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Production Ops"
        subtitle="Kitchen production, delivery planning, and daily operations visibility"
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <BranchSelector />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <TabsList className="flex w-full gap-1 bg-transparent p-0">
              {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div>
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
