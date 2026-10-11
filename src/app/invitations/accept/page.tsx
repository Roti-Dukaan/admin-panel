"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Loader2, CheckCircle, AlertCircle, Mail, ShieldCheck, User } from "lucide-react";
import { apiClient } from "@/lib/api/http";
import { adminAuthApi } from "@/features/admin-auth/api/admin-auth.api";
import { toast } from "sonner";
import { normalizeEmail } from "@/lib/utils/email";

type InvitationPreview = {
  email: string;
  name: string | null;
  role: string;
  branchName: string | null;
  expiresAt: string;
};

function AcceptInvitationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token");
      setLoadingPreview(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get("/invitations/preview", { params: { token } });
        if (!cancelled) setInvitation(data.data);
      } catch (err: any) {
        const message = err.response?.data?.message || "Invalid or expired invitation";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!token || !invitation) return;
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/invitations/accept", { token });
      const email = normalizeEmail(invitation.email);
      try {
        await adminAuthApi.sendOtp(email);
      } catch {
        // Account is created; user can still request OTP on the login page.
      }
      setSubmitted(true);
      toast.success("Invitation accepted. Enter the OTP sent to your email.");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&otp=1`);
      }, 1200);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to accept invitation";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full mx-4 text-center"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-500">The invitation link is missing or invalid.</p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full mx-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4"
          >
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation accepted</h2>
          <p className="text-gray-500 mb-6">We sent a one-time code to your email. Redirecting to sign in...</p>
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
          <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full">
            <div className="max-w-xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Roti Dukaan</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                Join <span className="text-orange-400">Roti Dukaan</span>
              </h1>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">
                Accept your invitation, then sign in with a one-time code sent to your email. No password needed.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="text-white font-medium">Use your invited name</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-white font-medium">Email OTP sign-in</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-white font-medium">Access admin portal</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Instant access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full lg:w-[45%] items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Accept Invitation</h2>
                <p className="text-gray-500 mt-1">Confirm the details below, then sign in with email OTP.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {loadingPreview ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : invitation ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
                    {invitation.name && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
                        <p className="font-medium text-gray-900">{invitation.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                      <p className="font-medium text-gray-900">{invitation.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Kitchen</p>
                      <p className="font-medium text-gray-900">{invitation.branchName || "Roti Dukaan"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Role</p>
                      <p className="font-medium text-gray-900">{invitation.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      "Accept invitation & send OTP"
                    )}
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>}>
      <AcceptInvitationPageContent />
    </Suspense>
  );
}
