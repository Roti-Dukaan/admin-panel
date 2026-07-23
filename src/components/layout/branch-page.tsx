"use client"

import * as React from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface BranchPageProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function BranchPage({
  title,
  description,
  children,
}: BranchPageProps) {
  const { isBranchManager } = useWorkspace()
  
  return (
    <div className="space-y-6">
      {children}
    </div>
  )
}
