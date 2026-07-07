"use client"

import { motion } from "motion/react"

const shapes = [
  { size: 80, x: "10%", y: "20%", delay: 0 },
  { size: 120, x: "75%", y: "15%", delay: 0.5 },
  { size: 60, x: "85%", y: "60%", delay: 1 },
  { size: 100, x: "20%", y: "70%", delay: 1.5 },
  { size: 50, x: "60%", y: "80%", delay: 2 },
  { size: 70, x: "40%", y: "10%", delay: 0.8 },
  { size: 90, x: "5%", y: "50%", delay: 1.2 },
  { size: 40, x: "90%", y: "35%", delay: 1.8 },
]

export function FloatingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/[0.04]"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  )
}
