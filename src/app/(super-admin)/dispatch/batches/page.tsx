"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useCreateDispatchBatch, useDispatchBatches } from "../hooks/useDispatch";

interface ReadyOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryZone: string | null;
  grandTotal: number;
}

export default function CreateBatchPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [provider, setProvider] = useState("borzo");
  const createMutation = useCreateDispatchBatch();

  const readyQuery = useDispatchBatches({ status: "READY", limit: 100 });

  const toggleOrder = (orderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleCreate = () => {
    if (selectedIds.length === 0) return;
    createMutation.mutate(
      { orderIds: selectedIds, provider },
      { onSuccess: () => router.push("..") }
    );
  };

  const orders = (readyQuery.data?.items as any[]) ?? [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        titleNode={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Dispatch Batch</h1>
              <p className="text-sm text-gray-500">Select ready orders to batch</p>
            </div>
          </div>
        }
        showSearch={false}
        actions={null}
      />

      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Provider:</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="borzo">Borzo</option>
            <option value="shadowfax">Shadowfax</option>
            <option value="pidge">Pidge</option>
            <option value="porter">Porter</option>
          </select>
          <span className="ml-auto text-sm text-gray-500">{selectedIds.length} selected</span>
          <Button
            onClick={handleCreate}
            disabled={selectedIds.length === 0 || createMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="mr-2 h-4 w-4" />
            )}
            Create Batch
          </Button>
        </div>

        {readyQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-500">No ready orders available.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order: any) => (
              <label
                key={order.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                  selectedIds.includes(order.id)
                    ? "border-orange-300 bg-orange-50 ring-1 ring-orange-200"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(order.id)}
                  onChange={() => toggleOrder(order.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    #{order.orderNumber ?? order.id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.customerName}
                    {order.deliveryZone ? ` • ${order.deliveryZone}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{order.grandTotal?.toFixed(2) ?? "0.00"}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
