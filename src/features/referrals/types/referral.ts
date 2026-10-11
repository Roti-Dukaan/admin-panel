export type ReferralCampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED" | "ARCHIVED";

export interface ReferralCampaign {
  id: string;
  name: string;
  code: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  status: ReferralCampaignStatus;
  referrerRewardAmountPaise: number;
  refereeRewardAmountPaise: number;
  qualifyingOrderMinimumAmountPaise: number;
  qualificationWindowDays: number;
  maxSuccessfulReferralsPerReferrer: number;
  maxTotalReferrerRewardPaise: number;
  rewardHoldDays: number;
  isActive: boolean;
  termsAndConditions: string | null;
}

export type ReferralStatus =
  | "INVITED"
  | "SIGNED_UP"
  | "PHONE_VERIFIED"
  | "PENDING_FIRST_ORDER"
  | "QUALIFYING_ORDER_PLACED"
  | "QUALIFYING_ORDER_PAID"
  | "QUALIFYING_ORDER_DELIVERED"
  | "REWARD_PENDING_REVIEW"
  | "REWARDS_CREDITED"
  | "FRAUD_REVIEW"
  | "FRAUD_REJECTED"
  | "EXPIRED"
  | string;

export type ReferralFraudStatus = "CLEAR" | "REVIEW" | "BLOCKED" | "APPROVED";

export interface ReferralPerson {
  id: string;
  fullName: string | null;
  name: string | null;
  phone: string | null;
}

export interface ReferralRecord {
  id: string;
  referralNo: string;
  campaignId: string;
  referrerCustomerId: string;
  refereeCustomerId: string | null;
  referralCode: string;
  source: string;
  status: ReferralStatus;
  qualifyingOrderNo: string | null;
  referrerRewardAmountPaise: number;
  refereeRewardAmountPaise: number;
  fraudScore: number;
  fraudStatus: ReferralFraudStatus;
  fraudReasonSummary: string | null;
  createdAt: string;
  rewardCreditedAt: string | null;
  referrer: ReferralPerson | null;
  referee: ReferralPerson | null;
  campaign: ReferralCampaign | null;
}

export interface PaginatedReferrals {
  items: ReferralRecord[];
  total: number;
  page: number;
  limit: number;
}

export function paiseToRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function displayName(person: ReferralPerson | null | undefined): string {
  if (!person) return "—";
  return person.fullName || person.name || person.phone || "Customer";
}

export function formatReferralStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
