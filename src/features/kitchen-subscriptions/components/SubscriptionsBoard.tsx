"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from "@/features/kitchen/components/SearchBar";
import { useDocumentPreview } from "@/features/documents/context/DocumentPreviewContext";
import {
  useSubscriptionKitchenSummary,
  useSubscriptionPrepList,
  useSubscriptionStatusMutation,
} from "../hooks/useKitchenSubscriptions";
import { SubscriptionStats, SubscriptionPrepSummary } from "./SubscriptionStats";
import { SubscriptionPrepTable } from "./SubscriptionPrepTable";
import { SubscriptionDispatchTicketModal } from "./SubscriptionDispatchTicketModal";
import type { SubscriptionKitchenSummary, SubscriptionPrepRow } from "../types/kitchen-subscriptions";

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">Something went wrong</p>
        <p className="text-sm text-gray-500">Could not load subscription prep data.</p>
      </div>
      <Button type="button" onClick={onRetry} className="bg-orange-500 hover:bg-orange-600">
        Retry
      </Button>
    </div>
  );
}

function withPrepStarted(row: SubscriptionPrepRow): SubscriptionPrepRow {
  return {
    ...row,
    prepStatus: "PREPARING",
    packingStatus: "IN_PROGRESS",
    status: "IN_KITCHEN",
  };
}

export function SubscriptionsBoard() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [slotId, setSlotId] = useState("all");
  const [ticketRow, setTicketRow] = useState<SubscriptionPrepRow | null>(null);

  const { openDocument } = useDocumentPreview();
  const filters = useMemo(() => ({ date, slotId, search }), [date, slotId, search]);
  const summaryQuery = useSubscriptionKitchenSummary(date);
  const prepQuery = useSubscriptionPrepList(filters);
  const mutation = useSubscriptionStatusMutation();

  const slotOptions = useMemo(() => {
    const slots = summaryQuery.data?.bySlot ?? [];
    return slots.map((slot) => ({ id: slot.slotId, name: slot.slotName }));
  }, [summaryQuery.data]);

  const filteredSummary = useMemo((): SubscriptionKitchenSummary | undefined => {
    const summary = summaryQuery.data;
    if (!summary) return undefined;
    if (slotId === "all") return summary;

    const slot = summary.bySlot.find((s) => s.slotId === slotId);
    if (!slot) {
      return {
        ...summary,
        totalDeliveries: 0,
        totalPacks: 0,
        totalRotis: 0,
        totalCustomers: 0,
        itemTotals: [],
        rotiTypeTotals: [],
        bySlot: [],
        statusCounts: {
          pending: 0,
          preparing: 0,
          packed: 0,
          readyForDispatch: 0,
        },
      };
    }

    return {
      ...summary,
      totalDeliveries: slot.deliveryCount,
      totalPacks: slot.packCount,
      totalRotis: slot.rotiCount,
      totalCustomers: slot.customerCount,
      itemTotals: slot.itemTotals ?? [],
      rotiTypeTotals: slot.rotiTypeTotals,
      bySlot: [],
    };
  }, [summaryQuery.data, slotId]);

  const stats = useMemo(() => {
    if (slotId !== "all") {
      const rows = prepQuery.data ?? [];
      return {
        pending: rows.filter((r) => r.prepStatus === "PENDING").length,
        preparing: rows.filter((r) => r.prepStatus === "PREPARING").length,
        packed: rows.filter((r) => r.prepStatus === "PACKED").length,
        readyForDispatch: rows.filter((r) => r.prepStatus === "READY").length,
        total: rows.length,
        totalRotis: rows.reduce((sum, r) => sum + r.totalQuantity, 0),
        totalPacks: rows.length,
      };
    }

    const counts = summaryQuery.data?.statusCounts;
    return {
      pending: counts?.pending ?? 0,
      preparing: counts?.preparing ?? 0,
      packed: counts?.packed ?? 0,
      readyForDispatch: counts?.readyForDispatch ?? 0,
      total: summaryQuery.data?.totalDeliveries ?? 0,
      totalRotis: summaryQuery.data?.totalRotis ?? 0,
      totalPacks: summaryQuery.data?.totalPacks ?? 0,
    };
  }, [prepQuery.data, slotId, summaryQuery.data]);

  const handleRefresh = () => {
    summaryQuery.refetch();
    prepQuery.refetch();
  };

  const updatingId = mutation.isPending
    ? (mutation.variables as { id: string } | undefined)?.id ?? null
    : null;

  const openDispatchTicket = useCallback(
    (row: SubscriptionPrepRow) => {
      if (row.orderId) {
        openDocument(row.orderId, "DELIVERY_LABEL");
        return;
      }
      setTicketRow(row);
    },
    [openDocument],
  );

  const handlePrep = useCallback(
    (id: string) => {
      const row = prepQuery.data?.find((r) => r.id === id);
      mutation.mutate(
        { id, action: "prep" },
        {
          onSuccess: () => {
            if (row) openDispatchTicket(withPrepStarted(row));
          },
        },
      );
    },
    [mutation, openDispatchTicket, prepQuery.data],
  );

  if ((prepQuery.isError || summaryQuery.isError) && !prepQuery.data && !summaryQuery.data) {
    return <ErrorState onRetry={handleRefresh} />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50/50 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-auto"
            aria-label="Prep date"
          />
          <Select value={slotId} onValueChange={setSlotId}>
            <SelectTrigger className="h-10 w-full sm:w-56" aria-label="Filter by delivery slot">
              <SelectValue placeholder="All Slots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Slots</SelectItem>
              {slotOptions.map((slot) => (
                <SelectItem key={slot.id} value={slot.id}>
                  {slot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} />
          {stats.readyForDispatch > 0 && (
            <Button
              type="button"
              variant="outline"
              href="/branch/subscription-dispatch"
              className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Dispatch Ready ({stats.readyForDispatch})
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <SubscriptionStats stats={stats} />
      <SubscriptionPrepSummary summary={filteredSummary} slotFilterActive={slotId !== "all"} />

      <SubscriptionPrepTable
        rows={prepQuery.data ?? []}
        onPrep={handlePrep}
        onPack={(id) => mutation.mutate({ id, action: "pack" })}
        onDispatch={(id) => mutation.mutate({ id, action: "dispatch" })}
        onPrintTicket={openDispatchTicket}
        updatingId={updatingId}
        isLoading={prepQuery.isLoading}
      />

      <SubscriptionDispatchTicketModal
        row={ticketRow}
        open={ticketRow !== null}
        onClose={() => setTicketRow(null)}
      />
    </div>
  );
}
