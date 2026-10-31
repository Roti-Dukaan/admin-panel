"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const ROTI_DUKAAN_LOGO_SRC = "/roti_dukaan_logo.png"

export type RotiDukaanLogoSize = "xs" | "sm" | "md" | "lg" | "xl"

const MARK_SIZE_PX: Record<RotiDukaanLogoSize, number> = {
  xs: 32,
  sm: 36,
  md: 40,
  lg: 44,
  xl: 56,
}

type LogoTheme = "light" | "dark"

export type RotiDukaanLogoProps = {
  size?: RotiDukaanLogoSize
  /** Circle for sidebar; rounded-xl for auth surfaces */
  shape?: "circle" | "rounded"
  showName?: boolean
  subtitle?: React.ReactNode
  theme?: LogoTheme
  href?: string
  className?: string
  /** When true, only the logo mark is shown (e.g. collapsed sidebar) */
  markOnly?: boolean
  onClick?: React.MouseEventHandler
  title?: string
  withShadow?: boolean
}

function LogoMark({
  size = "md",
  shape = "rounded",
  withShadow = false,
  className,
}: Pick<RotiDukaanLogoProps, "size" | "shape" | "withShadow" | "className">) {
  const px = MARK_SIZE_PX[size]
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden ring-2 ring-orange-500/20",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        withShadow && "shadow-lg shadow-orange-500/30",
        className,
      )}
      style={{ width: px, height: px }}
    >
      <img src={ROTI_DUKAAN_LOGO_SRC} alt="Roti Dukaan" className="h-full w-full object-cover" />
    </div>
  )
}

export function RotiDukaanLogo({
  size = "md",
  shape = "rounded",
  showName = true,
  subtitle,
  theme = "dark",
  href,
  className,
  markOnly = false,
  onClick,
  title,
  withShadow = false,
}: RotiDukaanLogoProps) {
  const nameClass =
    theme === "light"
      ? "text-gray-900"
      : "text-white"

  const subtitleClass =
    theme === "light"
      ? "text-gray-400"
      : "text-white/70"

  const nameSizeClass =
    size === "xl" ? "text-xl font-bold" : size === "lg" ? "text-lg font-bold" : "text-[15px] font-bold leading-tight"

  const content = (
    <>
      <LogoMark size={size} shape={shape} withShadow={withShadow} />
      {!markOnly && showName && (
        <div className="flex min-w-0 flex-col">
          <span className={cn(nameSizeClass, nameClass)}>Roti Dukaan</span>
          {subtitle != null && (
            typeof subtitle === "string" ? (
              <span className={cn("text-xs", subtitleClass)}>{subtitle}</span>
            ) : (
              subtitle
            )
          )}
        </div>
      )}
    </>
  )

  const wrapperClass = cn(
    "flex items-center gap-2.5 min-w-0",
    href && "group",
    className,
  )

  if (href) {
    return (
      <Link href={href} className={wrapperClass} onClick={onClick} title={title}>
        {content}
      </Link>
    )
  }

  return (
    <div className={wrapperClass} onClick={onClick} title={title}>
      {content}
    </div>
  )
}

export { LogoMark as RotiDukaanLogoMark }
