"use client";

import { Badge } from "@/components/ui/badge";
import type { ReferralCampaign } from "../types/referral";
import { paiseToRupees } from "../types/referral";

interface CampaignsTableProps {
  campaigns: ReferralCampaign[];
  onEdit: (campaign: ReferralCampaign) => void;
  onActivate: (campaign: ReferralCampaign) => void;
  onPause: (campaign: ReferralCampaign) => void;
  onEnd: (campaign: ReferralCampaign) => void;
}

export function CampaignsTable({ campaigns, onEdit, onActivate, onPause, onEnd }: CampaignsTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        No referral campaigns found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Campaign</th>
            <th className="px-4 py-3">Referrer Reward</th>
            <th className="px-4 py-3">Referee Reward</th>
            <th className="px-4 py-3">Min Order</th>
            <th className="px-4 py-3">Window</th>
            <th className="px-4 py-3">Referral Cap</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">End</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-gray-50/80">
              <td className="px-4 py-3">
                <div className="font-bold text-gray-900">{campaign.name}</div>
                <div className="text-xs text-gray-500">{campaign.code}</div>
              </td>
              <td className="px-4 py-3 font-semibold">{paiseToRupees(campaign.referrerRewardAmountPaise)}</td>
              <td className="px-4 py-3 font-semibold">{paiseToRupees(campaign.refereeRewardAmountPaise)}</td>
              <td className="px-4 py-3">{paiseToRupees(campaign.qualifyingOrderMinimumAmountPaise)}</td>
              <td className="px-4 py-3">{campaign.qualificationWindowDays} days</td>
              <td className="px-4 py-3">{campaign.maxSuccessfulReferralsPerReferrer}</td>
              <td className="px-4 py-3">
                <Badge variant={campaign.status === "ACTIVE" && campaign.isActive ? "default" : "secondary"}>
                  {campaign.status}
                </Badge>
              </td>
              <td className="px-4 py-3">{new Date(campaign.startAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                {campaign.endAt ? new Date(campaign.endAt).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button className="text-xs font-semibold text-gray-700 hover:underline" onClick={() => onEdit(campaign)}>
                    Edit
                  </button>
                  {campaign.status !== "ACTIVE" && (
                    <button className="text-xs font-semibold text-green-700 hover:underline" onClick={() => onActivate(campaign)}>
                      Activate
                    </button>
                  )}
                  {campaign.status === "ACTIVE" && (
                    <button className="text-xs font-semibold text-amber-700 hover:underline" onClick={() => onPause(campaign)}>
                      Pause
                    </button>
                  )}
                  {campaign.status !== "ENDED" && campaign.status !== "ARCHIVED" && (
                    <button className="text-xs font-semibold text-red-700 hover:underline" onClick={() => onEnd(campaign)}>
                      End
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
