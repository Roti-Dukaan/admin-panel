"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  index: number
}

export function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      className="flex items-start gap-3 rounded-xl bg-white/[0.06] p-4 backdrop-blur-sm border border-white/[0.06]"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}
