"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { AuthStep } from "../types/admin-auth"

const DEMO_OTP = "483921"

export function useAdminLogin() {
  const router = useRouter()
  const [step, setStep] = React.useState<AuthStep>("email")
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)
  const [countdown, setCountdown] = React.useState(0)

  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleContinue = React.useCallback(async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setStep("otp")
    setCountdown(30)
    toast.info("Demo OTP: 483921")
  }, [email])

  const handleVerifyOtp = React.useCallback(async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    if (otp === DEMO_OTP) {
      toast.success("Login successful!")
      router.push("/dashboard")
    } else {
      toast.error("Invalid OTP. Please try again.")
      setOtp("")
    }
  }, [otp, router])

  const handleResendOtp = React.useCallback(async () => {
    if (countdown > 0) return
    setIsResending(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsResending(false)
    setCountdown(30)
    toast.info("OTP resent. Demo OTP: 483921")
  }, [countdown])

  const handleBack = React.useCallback(() => {
    setStep("email")
    setOtp("")
  }, [])

  return {
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
  }
}
