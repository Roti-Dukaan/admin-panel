"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { AuthStep } from "../types/admin-auth"
import { adminAuthApi } from "../api/admin-auth.api"
import { useAdminAuthStore } from "../store/admin-auth-store"
import {
  getPostLoginPath,
  resolvePrimaryRole,
  workspaceFromRoles,
} from "../utils/role-utils"
import { isDevOtpVisible } from "@/lib/env"

export function useAdminLogin() {
  const router = useRouter()
  const [step, setStep] = React.useState<AuthStep>("email")
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null)
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
    try {
      const result = await adminAuthApi.sendOtp(email)
      setStep("otp")
      setCountdown(30)
      toast.success("OTP sent to your email")
      if (result?.otp && isDevOtpVisible()) {
        setDevOtpHint(result.otp)
        toast.info(`Dev OTP: ${result.otp}`, { duration: 15000 })
      } else {
        setDevOtpHint(null)
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to send OTP"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [email])

  const handleVerifyOtp = React.useCallback(async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }
    setIsLoading(true)
    try {
      const result = await adminAuthApi.login(email, otp)
      useAdminAuthStore.getState().login(
        result.admin,
        result.accessToken,
        result.refreshToken,
      )

      const role = resolvePrimaryRole(result.admin.roles) || 'SUPER_ADMIN'
      const workspace = workspaceFromRoles(result.admin.roles) || 'SUPER_ADMIN'

      if (typeof window !== 'undefined') {
        document.cookie = `workspace=${workspace}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        document.cookie = `user-role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        if (result.admin.branchId) {
          document.cookie = `branch-id=${result.admin.branchId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        }
      }

      toast.success("Login successful!")
      router.push(getPostLoginPath(result.admin.roles))
    } catch (err: any) {
      const message = err?.response?.data?.message || "Invalid OTP"
      toast.error(message)
      setOtp("")
    } finally {
      setIsLoading(false)
    }
  }, [otp, email, router])

  const handleResendOtp = React.useCallback(async () => {
    if (countdown > 0) return
    setIsResending(true)
    try {
      const result = await adminAuthApi.sendOtp(email)
      setCountdown(30)
      toast.success("OTP resent successfully")
      if (result?.otp && isDevOtpVisible()) {
        setDevOtpHint(result.otp)
        toast.info(`Dev OTP: ${result.otp}`, { duration: 15000 })
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to resend OTP"
      toast.error(message)
    } finally {
      setIsResending(false)
    }
  }, [countdown, email])

  const handleBack = React.useCallback(() => {
    setStep("email")
    setOtp("")
    setDevOtpHint(null)
  }, [])

  return {
    step,
    email,
    otp,
    devOtpHint,
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
