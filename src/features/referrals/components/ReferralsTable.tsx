"use client";

import { Badge } from "@/components/ui/badge";
import type { ReferralRecord } from "../types/referral";
import { displayName, formatReferralStatus, paiseToRupees } from "../types/referral";

interface ReferralsTableProps {
  referrals: ReferralRecord[];
}

export function ReferralsTable({ referrals }: ReferralsTableProps) {
  if (referrals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        No referrals found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Referral ID</th>
            <th className="px-4 py-3">Referrer</th>
            <th className="px-4 py-3">Referee</th>
            <th className="px-4 py-3">Campaign</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Qualifying Order</th>
            <th className="px-4 py-3">Reward</th>
            <th className="px-4 py-3">Fraud</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {referrals.map((referral) => (
            <tr key={referral.id} className="hover:bg-gray-50/80">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{referral.referralNo}</td>
              <td className="px-4 py-3">{displayName(referral.referrer)}</td>
              <td className="px-4 py-3">{displayName(referral.referee)}</td>
              <td className="px-4 py-3">{referral.campaign?.name ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-xs">{referral.referralCode}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary">{formatReferralStatus(referral.status)}</Badge>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{referral.qualifyingOrderNo ?? "—"}</td>
              <td className="px-4 py-3">{paiseToRupees(referral.referrerRewardAmountPaise)}</td>
              <td className="px-4 py-3">
                <div className="font-semibold">{referral.fraudScore}</div>
                <div className="text-xs text-gray-500">{referral.fraudStatus}</div>
              </td>
              <td className="px-4 py-3">{new Date(referral.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
