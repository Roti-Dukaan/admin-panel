"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { referralsApi } from "@/features/referrals/services/referrals.api";
import { ReferralsTable } from "@/features/referrals/components/ReferralsTable";
import type { ReferralRecord } from "@/features/referrals/types/referral";

export default function ReferralTrackingPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await referralsApi.listReferrals({
        page,
        limit: 25,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setReferrals(result.items);
      setTotal(result.total);
    } catch {
      setReferrals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Referral Tracking"
        subtitle="Monitor referral relationships, qualifying orders, and reward status."
        actions={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="PHONE_VERIFIED">Phone verified</option>
            <option value="PENDING_FIRST_ORDER">Pending first order</option>
            <option value="QUALIFYING_ORDER_DELIVERED">Order delivered</option>
            <option value="REWARD_PENDING_REVIEW">Reward pending review</option>
            <option value="REWARDS_CREDITED">Rewards credited</option>
            <option value="FRAUD_REVIEW">Fraud review</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <p className="text-sm text-gray-500">{total} referrals</p>
        </div>

        <ReferralsTable referrals={referrals} />

        {total > 25 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">Page {page}</span>
            <button
              disabled={page * 25 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
