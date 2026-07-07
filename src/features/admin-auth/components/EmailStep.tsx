"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail } from "lucide-react"

interface EmailStepProps {
  email: string
  onEmailChange: (email: string) => void
  onContinue: () => void
  isLoading: boolean
}

export function EmailStep({ email, onEmailChange, onContinue, isLoading }: EmailStepProps) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome Back
        </h1>
        <p className="text-base text-gray-500">
          Admin Sign In
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-300 focus:ring-orange-200 text-base"
            />
          </div>
        </div>

        <Button
          onClick={onContinue}
          disabled={!isValid || isLoading}
          className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
