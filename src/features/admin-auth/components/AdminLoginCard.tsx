"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { PhoneStep } from "./PhoneStep"
import { OtpStep } from "./OtpStep"
import { useAdminLogin } from "../hooks/useAdminLogin"
import { Store } from "lucide-react"

export function AdminLoginCard() {
  const {
    step,
    phoneNumber,
    otp,
    isLoading,
    isResending,
    countdown,
    setPhoneNumber,
    setOtp,
    handleContinue,
    handleVerifyOtp,
    handleResendOtp,
    handleBack,
  } = useAdminLogin()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-2xl shadow-gray-200/50 border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Roti Dukaan</h2>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <PhoneStep
            key="phone"
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
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
            phoneNumber={phoneNumber}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
