"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout/header";
import { referralsApi } from "@/features/referrals/services/referrals.api";
import { FraudReviewList } from "@/features/referrals/components/FraudReviewList";
import type { ReferralRecord } from "@/features/referrals/types/referral";

export default function ReferralFraudReviewPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await referralsApi.listFraudReview({ page: 1, limit: 50 });
      setReferrals(result.items);
    } catch {
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Referral Fraud Review"
        subtitle="Review suspicious referrals before wallet rewards are credited."
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
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p>
            Approve only after verifying referrer and referee are distinct real customers. Rejecting
            cancels pending rewards.
          </p>
        </div>

        <FraudReviewList
          referrals={referrals}
          onApprove={async (id) => {
            await referralsApi.approveReferral(id);
            await load();
          }}
          onReject={async (id, reason) => {
            await referralsApi.rejectReferral(id, reason);
            await load();
          }}
        />
      </div>
    </div>
  );
}
