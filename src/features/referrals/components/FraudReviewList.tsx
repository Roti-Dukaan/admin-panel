"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReferralRecord } from "../types/referral";
import { displayName, paiseToRupees } from "../types/referral";

interface FraudReviewListProps {
  referrals: ReferralRecord[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export function FraudReviewList({ referrals, onApprove, onReject }: FraudReviewListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (referrals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        No referrals pending fraud review.
      </div>
    );
  }

  const handle = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      if (action === "approve") await onApprove(id);
      else await onReject(id, "Rejected after manual fraud review");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
        <div key={referral.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-gray-900">{referral.referralNo}</h3>
                <Badge variant="secondary">{referral.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">Referrer:</span> {displayName(referral.referrer)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Referee:</span> {displayName(referral.referee)}
              </p>
              {referral.qualifyingOrderNo && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Qualifying order:</span> {referral.qualifyingOrderNo}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fraud score</p>
              <p className="text-2xl font-bold text-orange-600">{referral.fraudScore}</p>
              <p className="text-xs text-gray-500">{referral.fraudStatus}</p>
            </div>
          </div>

          {referral.fraudReasonSummary && (
            <div className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-900">
              <span className="font-semibold">Reasons:</span> {referral.fraudReasonSummary}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Reward: {paiseToRupees(referral.referrerRewardAmountPaise)} referrer /{" "}
              {paiseToRupees(referral.refereeRewardAmountPaise)} referee
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={busyId === referral.id}
                onClick={() => handle(referral.id, "reject")}
              >
                Reject
              </Button>
              <Button disabled={busyId === referral.id} onClick={() => handle(referral.id, "approve")}>
                Approve Rewards
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
