"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Shield, RotateCcw } from "lucide-react"

interface OtpStepProps {
  otp: string
  onOtpChange: (otp: string) => void
  onVerify: () => void
  onResend: () => void
  onBack: () => void
  isLoading: boolean
  isResending: boolean
  countdown: number
  email: string
  devOtpHint?: string | null
}

export function OtpStep({
  otp,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  isLoading,
  isResending,
  countdown,
  email,
  devOtpHint,
}: OtpStepProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = otp.split("")
    newOtp[index] = value
    onOtpChange(newOtp.join(""))

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onOtpChange(pasted)
    if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
            <Shield className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Verify OTP
            </h1>
            <p className="text-sm text-gray-500">
              Sent to {email}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {devOtpHint ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Dev login OTP
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-[0.35em] text-amber-900">
              {devOtpHint}
            </p>
          </div>
        ) : null}

        <div className="flex justify-between gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={otp[i] || ""}
              onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-14 w-12 rounded-xl border border-gray-200 bg-gray-50/50 text-center text-xl font-bold text-gray-900 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
            />
          ))}
        </div>

        <Button
          onClick={onVerify}
          disabled={otp.length !== 6 || isLoading}
          className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in{" "}
              <span className="font-semibold text-orange-500">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={onResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              {isResending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
