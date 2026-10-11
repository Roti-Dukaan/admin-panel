"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { referralsApi } from "@/features/referrals/services/referrals.api";

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ReferralReportsPage() {
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await referralsApi.getReports());
    } catch {
      setStats({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { label: "Invitations generated", value: numberValue(stats.invitationsGenerated) },
    { label: "Code applications", value: numberValue(stats.referralCodeApplications) },
    { label: "Verified referees", value: numberValue(stats.verifiedReferees) },
    { label: "First orders placed", value: numberValue(stats.firstOrdersPlaced) },
    { label: "Qualifying delivered", value: numberValue(stats.qualifyingOrdersDelivered) },
    { label: "Successful referrals", value: numberValue(stats.successfulReferrals) },
    { label: "Pending referrals", value: numberValue(stats.pendingReferrals) },
    { label: "Expired referrals", value: numberValue(stats.expiredReferrals) },
    { label: "Fraud blocked", value: numberValue(stats.fraudBlockedReferrals) },
    { label: "Wallet credits issued", value: `₹${numberValue(stats.totalWalletCreditsIssued)}` },
    { label: "Wallet credits redeemed", value: `₹${numberValue(stats.totalWalletCreditsRedeemed)}` },
    {
      label: "Conversion rate",
      value: `${Math.round(numberValue(stats.referralConversionRate) * 100)}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="Referral Reports"
        subtitle="Track referral funnel, wallet credits, and conversion."
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
      <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
