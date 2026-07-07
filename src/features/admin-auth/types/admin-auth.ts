export type AuthStep = "phone" | "otp"

export interface AdminAuthState {
  step: AuthStep
  phoneNumber: string
  otp: string
  isLoading: boolean
  isResending: boolean
  countdown: number
}

export interface AdminAuthActions {
  setPhoneNumber: (phone: string) => void
  setOtp: (otp: string) => void
  handleContinue: () => void
  handleVerifyOtp: () => void
  handleResendOtp: () => void
  handleBack: () => void
}
