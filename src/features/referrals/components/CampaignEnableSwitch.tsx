"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ReferralCampaign } from "../types/referral";

export function isReferralCampaignEnabled(campaign: ReferralCampaign): boolean {
  return campaign.status === "ACTIVE" && campaign.isActive;
}

export function canToggleReferralCampaign(campaign: ReferralCampaign): boolean {
  return campaign.status !== "ENDED" && campaign.status !== "ARCHIVED";
}

interface CampaignEnableSwitchProps {
  campaign: ReferralCampaign;
  disabled?: boolean;
  onToggle: (campaign: ReferralCampaign, enabled: boolean) => void | Promise<void>;
}

/** Orange switch + pill label — same pattern as menu availability controls. */
export function CampaignEnableSwitch({
  campaign,
  disabled,
  onToggle,
}: CampaignEnableSwitchProps) {
  const enabled = isReferralCampaignEnabled(campaign);
  const canToggle = canToggleReferralCampaign(campaign);

  return (
    <div className="flex items-center gap-2.5">
      <Switch
        checked={enabled}
        disabled={disabled || !canToggle}
        onCheckedChange={(checked) => onToggle(campaign, checked)}
        aria-label={enabled ? "Disable referral campaign" : "Enable referral campaign"}
      />
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          enabled
            ? "bg-emerald-50 text-emerald-700"
            : "bg-gray-100 text-gray-600",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            enabled ? "bg-emerald-500" : "bg-gray-400",
          )}
        />
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}
