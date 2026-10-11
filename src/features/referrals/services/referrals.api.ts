import { apiClient } from "@/lib/api/http";
import type { PaginatedReferrals, ReferralCampaign, ReferralRecord } from "../types/referral";

function coerceIsoDate(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function coerceNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCampaign(raw: Record<string, unknown>): ReferralCampaign {
  return {
    id: String(raw.id),
    name: String(raw.name),
    code: String(raw.code),
    description: (raw.description as string | null) ?? null,
    startAt: coerceIsoDate(raw.startAt ?? raw.start_at),
    endAt: raw.endAt != null || raw.end_at != null ? coerceIsoDate(raw.endAt ?? raw.end_at) : null,
    status: String(raw.status) as ReferralCampaign["status"],
    referrerRewardAmountPaise: coerceNumber(raw.referrerRewardAmountPaise ?? raw.referrer_reward_amount_paise),
    refereeRewardAmountPaise: coerceNumber(raw.refereeRewardAmountPaise ?? raw.referee_reward_amount_paise),
    qualifyingOrderMinimumAmountPaise: coerceNumber(
      raw.qualifyingOrderMinimumAmountPaise ?? raw.qualifying_order_minimum_amount_paise,
    ),
    qualificationWindowDays: coerceNumber(raw.qualificationWindowDays ?? raw.qualification_window_days, 30),
    maxSuccessfulReferralsPerReferrer: coerceNumber(
      raw.maxSuccessfulReferralsPerReferrer ?? raw.max_successful_referrals_per_referrer,
      5,
    ),
    maxTotalReferrerRewardPaise: coerceNumber(
      raw.maxTotalReferrerRewardPaise ?? raw.max_total_referrer_reward_paise,
    ),
    rewardHoldDays: coerceNumber(raw.rewardHoldDays ?? raw.reward_hold_days),
    isActive: Boolean(raw.isActive ?? raw.is_active),
    termsAndConditions: (raw.termsAndConditions ?? raw.terms_and_conditions) as string | null,
  };
}

function normalizePerson(raw: unknown): ReferralRecord["referrer"] {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  return {
    id: String(p.id ?? ""),
    fullName: (p.fullName as string | null) ?? null,
    name: (p.name as string | null) ?? null,
    phone: (p.phone as string | null) ?? null,
  };
}

function normalizeReferral(raw: Record<string, unknown>): ReferralRecord {
  const campaignRaw = raw.campaign as Record<string, unknown> | null | undefined;
  return {
    id: String(raw.id),
    referralNo: String(raw.referralNo ?? raw.referral_no ?? ""),
    campaignId: String(raw.campaignId ?? raw.campaign_id ?? ""),
    referrerCustomerId: String(raw.referrerCustomerId ?? raw.referrer_customer_id ?? ""),
    refereeCustomerId: (raw.refereeCustomerId ?? raw.referee_customer_id) as string | null,
    referralCode: String(raw.referralCode ?? raw.referral_code ?? ""),
    source: String(raw.source ?? ""),
    status: String(raw.status) as ReferralRecord["status"],
    qualifyingOrderNo: (raw.qualifyingOrderNo ?? raw.qualifying_order_no) as string | null,
    referrerRewardAmountPaise: coerceNumber(raw.referrerRewardAmountPaise ?? raw.referrer_reward_amount_paise),
    refereeRewardAmountPaise: coerceNumber(raw.refereeRewardAmountPaise ?? raw.referee_reward_amount_paise),
    fraudScore: coerceNumber(raw.fraudScore ?? raw.fraud_score),
    fraudStatus: String(raw.fraudStatus ?? raw.fraud_status ?? "CLEAR") as ReferralRecord["fraudStatus"],
    fraudReasonSummary: (raw.fraudReasonSummary ?? raw.fraud_reason_summary) as string | null,
    createdAt: coerceIsoDate(raw.createdAt ?? raw.created_at),
    rewardCreditedAt:
      raw.rewardCreditedAt != null || raw.reward_credited_at != null
        ? coerceIsoDate(raw.rewardCreditedAt ?? raw.reward_credited_at)
        : null,
    referrer: normalizePerson(raw.referrer),
    referee: normalizePerson(raw.referee),
    campaign: campaignRaw ? normalizeCampaign(campaignRaw) : null,
  };
}

function normalizePaginated(data: unknown): PaginatedReferrals {
  const raw = (data ?? {}) as Record<string, unknown>;
  const items = Array.isArray(raw.items) ? raw.items : [];
  return {
    items: items
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map(normalizeReferral),
    total: coerceNumber(raw.total),
    page: coerceNumber(raw.page, 1),
    limit: coerceNumber(raw.limit, 20),
  };
}

export const referralsApi = {
  async listCampaigns(): Promise<ReferralCampaign[]> {
    const { data } = await apiClient.get("/admin/referrals/campaigns");
    const rows = (data?.data ?? data ?? []) as Record<string, unknown>[];
    return Array.isArray(rows) ? rows.map(normalizeCampaign) : [];
  },

  async listReferrals(params?: {
    status?: string;
    fraudStatus?: string;
    campaignId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedReferrals> {
    const { data } = await apiClient.get("/admin/referrals", { params });
    return normalizePaginated(data?.data ?? data);
  },

  async listFraudReview(params?: { page?: number; limit?: number }): Promise<PaginatedReferrals> {
    const { data } = await apiClient.get("/admin/referrals/fraud-review", { params });
    return normalizePaginated(data?.data ?? data);
  },

  async approveReferral(id: string): Promise<void> {
    await apiClient.post(`/admin/referrals/${id}/approve`);
  },

  async rejectReferral(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/referrals/${id}/reject`, { reason });
  },

  async reverseReferral(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/referrals/${id}/reverse-reward`, { reason });
  },

  async createCampaign(body: Record<string, unknown>): Promise<ReferralCampaign> {
    const { data } = await apiClient.post("/admin/referrals/campaigns", body);
    return normalizeCampaign((data?.data ?? data) as Record<string, unknown>);
  },

  async updateCampaign(id: string, body: Record<string, unknown>): Promise<ReferralCampaign> {
    const { data } = await apiClient.patch(`/admin/referrals/campaigns/${id}`, body);
    return normalizeCampaign((data?.data ?? data) as Record<string, unknown>);
  },

  async activateCampaign(id: string): Promise<void> {
    await apiClient.post(`/admin/referrals/campaigns/${id}/activate`);
  },

  async pauseCampaign(id: string): Promise<void> {
    await apiClient.post(`/admin/referrals/campaigns/${id}/pause`);
  },

  async endCampaign(id: string): Promise<void> {
    await apiClient.post(`/admin/referrals/campaigns/${id}/end`);
  },

  async getReports(): Promise<Record<string, unknown>> {
    const { data } = await apiClient.get("/admin/referrals/reports");
    return (data?.data ?? data ?? {}) as Record<string, unknown>;
  },
};
