"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { EmailStep } from "./EmailStep"
import { OtpStep } from "./OtpStep"
import { useAdminLogin } from "../hooks/useAdminLogin"
import { RotiDukaanLogo } from "@/components/brand/RotiDukaanLogo"

export function AdminLoginCard() {
  const {
    step,
    email,
    otp,
    isLoading,
    isResending,
    countdown,
    setEmail,
    setOtp,
    handleContinue,
    handleVerifyOtp,
    handleResendOtp,
    handleBack,
    devOtpHint,
  } = useAdminLogin()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-2xl shadow-gray-200/50 border border-gray-100"
    >
      <div className="mb-8">
        <RotiDukaanLogo size="md" theme="light" subtitle="Admin Portal" />
      </div>

      <AnimatePresence mode="wait">
        {step === "email" ? (
          <EmailStep
            key="email"
            email={email}
            onEmailChange={setEmail}
            onContinue={handleContinue}
            isLoading={isLoading}
          />
        ) : (
          <OtpStep
            key="otp"
            otp={otp}
            onOtpChange={setOtp}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={handleBack}
            isLoading={isLoading}
            isResending={isResending}
            countdown={countdown}
            email={email}
            devOtpHint={devOtpHint}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
