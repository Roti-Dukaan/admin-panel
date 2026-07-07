"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Phone } from "lucide-react"

interface PhoneStepProps {
  phoneNumber: string
  onPhoneChange: (phone: string) => void
  onContinue: () => void
  isLoading: boolean
}

export function PhoneStep({ phoneNumber, onPhoneChange, onContinue, isLoading }: PhoneStepProps) {
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
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              +91
            </span>
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                onPhoneChange(value)
              }}
              className="pl-14 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-300 focus:ring-orange-200 text-base"
            />
          </div>
        </div>

        <Button
          onClick={onContinue}
          disabled={phoneNumber.length !== 10 || isLoading}
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

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2">
        <Phone className="h-4 w-4" />
        Request a Call
      </button>
    </motion.div>
  )
}
