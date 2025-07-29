'use client'

import { useClientOnly } from '@/hooks/use-client-only'

export default function ClientYear() {
  const isClient = useClientOnly()
  
  // Use a consistent year for SSR and initial client render
  const currentYear = new Date().getFullYear()

  return (
    <span suppressHydrationWarning>
      {currentYear}
    </span>
  )
} 