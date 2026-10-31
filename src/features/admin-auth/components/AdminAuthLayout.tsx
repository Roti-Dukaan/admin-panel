"use client"

import { motion } from "motion/react"
import { RotiDukaanLogo } from "@/components/brand/RotiDukaanLogo"
import { FloatingBackground } from "./FloatingBackground"
import { FeatureCard } from "./FeatureCard"
import { AdminLoginCard } from "./AdminLoginCard"

const features = [
  {
    icon: "📦",
    title: "Order Management",
    description: "Manage all incoming customer orders.",
  },
  {
    icon: "👨‍🍳",
    title: "Kitchen Operations",
    description: "Track food preparation in real time.",
  },
  {
    icon: "👥",
    title: "Customer Management",
    description: "View customers, subscriptions and order history.",
  },
  {
    icon: "📊",
    title: "Business Analytics",
    description: "Monitor revenue, sales and growth.",
  },
]

export function AdminAuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <FloatingBackground />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RotiDukaanLogo size="lg" theme="dark" withShadow subtitle="Admin & Branch Portal" />
          </motion.div>

          {/* Content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight"
              >
                Roti Dukaan
                <br />
                <span className="text-orange-400">Admin Portal</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/60 max-w-lg leading-relaxed"
              >
                Manage orders, kitchen operations, subscriptions and business insights from one place.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {features.map((feature, i) => (
                <FeatureCard key={feature.title} {...feature} index={i} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-sm text-white/40"
          >
            © 2026 Roti Dukaan · Version 1.0.0
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-[40%] flex-col items-center justify-center bg-white px-6 py-12 relative">
        {/* Mobile Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 lg:hidden"
        >
          <RotiDukaanLogo size="md" theme="light" subtitle="Admin & Branch Portal" />
        </motion.div>

        <AdminLoginCard />

        {/* Forgot Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center max-w-sm"
        >
          <p className="text-sm font-medium text-gray-700">Need access?</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Please contact the Super Administrator to request Admin Portal access.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-auto pt-12 text-center lg:hidden"
        >
          <p className="text-xs text-gray-400">
            © 2026 Roti Dukaan · Version 1.0.0
          </p>
        </motion.div>
      </div>
    </div>
  )
}
