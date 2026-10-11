"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, Plus, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { referralsApi } from "@/features/referrals/services/referrals.api";
import { CampaignsTable } from "@/features/referrals/components/CampaignsTable";
import { CampaignEditor } from "@/features/referrals/components/CampaignEditor";
import type { ReferralCampaign } from "@/features/referrals/types/referral";
import { paiseToRupees } from "@/features/referrals/types/referral";

export default function ReferralCampaignsPage() {
  const [campaigns, setCampaigns] = useState<ReferralCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<ReferralCampaign | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCampaigns(await referralsApi.listCampaigns());
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.status === "ACTIVE" && c.isActive),
    [campaigns],
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Referral Campaigns"
        subtitle="Configure and monitor Refer & Earn wallet credit campaigns."
        actions={
          <>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setSelected(null);
                setEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {activeCampaign && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <Gift className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Active: {activeCampaign.name}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {paiseToRupees(activeCampaign.referrerRewardAmountPaise)} referrer +{" "}
                  {paiseToRupees(activeCampaign.refereeRewardAmountPaise)} referee after first delivered order of{" "}
                  {paiseToRupees(activeCampaign.qualifyingOrderMinimumAmountPaise)} or more within{" "}
                  {activeCampaign.qualificationWindowDays} days.
                </p>
              </div>
            </div>
          </div>
        )}

        <CampaignsTable
          campaigns={campaigns}
          onEdit={(campaign) => {
            setSelected(campaign);
            setEditorOpen(true);
          }}
          onActivate={async (campaign) => {
            await referralsApi.activateCampaign(campaign.id);
            await load();
          }}
          onPause={async (campaign) => {
            await referralsApi.pauseCampaign(campaign.id);
            await load();
          }}
          onEnd={async (campaign) => {
            await referralsApi.endCampaign(campaign.id);
            await load();
          }}
        />
      </div>

      <CampaignEditor
        open={editorOpen}
        campaign={selected}
        onClose={() => setEditorOpen(false)}
        onSave={async (payload) => {
          if (selected) {
            await referralsApi.updateCampaign(selected.id, payload);
          } else {
            await referralsApi.createCampaign(payload);
          }
          await load();
        }}
      />
    </div>
  );
}
