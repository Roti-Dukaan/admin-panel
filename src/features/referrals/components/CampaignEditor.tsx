"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReferralCampaign } from "../types/referral";

interface CampaignEditorProps {
  open: boolean;
  campaign: ReferralCampaign | null;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}

function rupeesFromPaise(paise: number) {
  return Math.round(paise / 100);
}

export function CampaignEditor({ open, campaign, onClose, onSave }: CampaignEditorProps) {
  const [name, setName] = useState("Refer & Earn");
  const [code, setCode] = useState("REFER_EARN");
  const [referrerReward, setReferrerReward] = useState(250);
  const [refereeReward, setRefereeReward] = useState(250);
  const [minOrder, setMinOrder] = useState(299);
  const [windowDays, setWindowDays] = useState(30);
  const [cap, setCap] = useState(5);
  const [holdDays, setHoldDays] = useState(0);
  const [allowWallet, setAllowWallet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(campaign?.name ?? "Refer & Earn");
    setCode(campaign?.code ?? "REFER_EARN");
    setReferrerReward(rupeesFromPaise(campaign?.referrerRewardAmountPaise ?? 25000));
    setRefereeReward(rupeesFromPaise(campaign?.refereeRewardAmountPaise ?? 25000));
    setMinOrder(rupeesFromPaise(campaign?.qualifyingOrderMinimumAmountPaise ?? 29900));
    setWindowDays(campaign?.qualificationWindowDays ?? 30);
    setCap(campaign?.maxSuccessfulReferralsPerReferrer ?? 5);
    setHoldDays(campaign?.rewardHoldDays ?? 0);
    setAllowWallet(false);
    setError(null);
  }, [open, campaign]);

  if (!open) return null;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        code,
        startAt: campaign?.startAt ?? new Date().toISOString(),
        referrerRewardAmountPaise: referrerReward * 100,
        refereeRewardAmountPaise: refereeReward * 100,
        qualifyingOrderMinimumAmountPaise: minOrder * 100,
        qualificationWindowDays: windowDays,
        maxSuccessfulReferralsPerReferrer: cap,
        maxTotalReferrerRewardPaise: cap * referrerReward * 100,
        rewardHoldDays: holdDays,
        allowWalletOnQualifyingOrder: allowWallet,
        minimumNonWalletPaidAmountPaise: minOrder * 100,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">{campaign ? "Edit campaign" : "Create campaign"}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm font-medium text-gray-700">
            Name
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="col-span-2 text-sm font-medium text-gray-700">
            Code
            <input className="mt-1 w-full rounded-lg border px-3 py-2 uppercase" value={code} onChange={(e) => setCode(e.target.value)} disabled={!!campaign} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Referrer reward ₹
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={referrerReward} onChange={(e) => setReferrerReward(Number(e.target.value))} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Referee reward ₹
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={refereeReward} onChange={(e) => setRefereeReward(Number(e.target.value))} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Min order ₹
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Window days
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Referral cap
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={cap} onChange={(e) => setCap(Number(e.target.value))} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Reward hold days
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={holdDays} onChange={(e) => setHoldDays(Number(e.target.value))} />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={allowWallet} onChange={(e) => setAllowWallet(e.target.checked)} />
            Allow wallet on qualifying order
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
