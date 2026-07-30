"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { KitchenBoard } from "@/features/kitchen/components/KitchenBoard"
import { SubscriptionsBoard } from "@/features/kitchen-subscriptions/components/SubscriptionsBoard"
import { SubscriptionDispatchBoard } from "@/features/kitchen-subscriptions/components/SubscriptionDispatchBoard"
import { usePrepClock } from "@/features/kitchen/hooks/usePrepClock"
import { useRealtimeConnectionStatus } from "@/lib/realtime/useRealtimeConnectionStatus"
import { format } from "date-fns"
import { Clock, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

type KitchenTab = "live" | "subscriptions" | "dispatch";

const TABS: { value: KitchenTab; label: string; emoji: string }[] = [
  { value: "live", label: "Live Orders", emoji: "🔥" },
  { value: "subscriptions", label: "Subscription Prep", emoji: "🔁" },
  { value: "dispatch", label: "Dispatch Ready", emoji: "🚚" },
];

function parseKitchenTab(value: string | null): KitchenTab {
  if (value === "subscriptions" || value === "dispatch") return value
  return "live"
}

function BranchKitchenPageContent() {
  const now = usePrepClock(true)
  const connected = useRealtimeConnectionStatus()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = React.useState<KitchenTab>(() => parseKitchenTab(searchParams.get("tab")))

  React.useEffect(() => {
    setActiveTab(parseKitchenTab(searchParams.get("tab")))
  }, [searchParams])

  const handleTabChange = (tab: KitchenTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "live") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }
    const query = params.toString()
    router.replace(query ? `/branch/kitchen?${query}` : "/branch/kitchen", { scroll: false })
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        titleNode={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kitchen Operations</h1>
              <p className="text-sm text-gray-500">{format(now, "EEEE, dd MMMM yyyy")}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  connected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}
              >
                {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {connected ? "Live" : "Offline"}
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Local Time</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-gray-900">
                {format(now, "hh:mm:ss a")}
              </span>
            </div>
          </div>
        }
        showSearch={false}
        actions={
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.value
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        }
      />
      {activeTab === "live" && <KitchenBoard />}
      {activeTab === "subscriptions" && <SubscriptionsBoard />}
      {activeTab === "dispatch" && <SubscriptionDispatchBoard />}
    </div>
  )
}

export default function BranchKitchenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <BranchKitchenPageContent />
    </Suspense>
  )
}
