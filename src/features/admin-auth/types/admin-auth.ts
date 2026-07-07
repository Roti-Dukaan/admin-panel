export type AuthStep = "email" | "otp"

export interface AdminAuthState {
  step: AuthStep
  email: string
  otp: string
  isLoading: boolean
  isResending: boolean
  countdown: number
}

export interface AdminAuthActions {
  setEmail: (email: string) => void
  setOtp: (otp: string) => void
  handleContinue: () => void
  handleVerifyOtp: () => void
  handleResendOtp: () => void
  handleBack: () => void
}
