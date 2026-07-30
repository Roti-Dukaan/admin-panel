"use client"



import * as React from 'react'



interface BranchPageProps {

  title: string

  description: string

  children: React.ReactNode

}



export default function BranchPage({

  children,

}: BranchPageProps) {

  return (

    <div className="space-y-6">

      {children}

    </div>

  )

}

