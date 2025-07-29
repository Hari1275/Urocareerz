'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ClientWrapper({ children, fallback }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // During SSR and initial render, show fallback or a consistent placeholder
  if (!isClient) {
    return fallback ? <>{fallback}</> : <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return <>{children}</>
} 