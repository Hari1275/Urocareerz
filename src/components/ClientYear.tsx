'use client'

import { useState, useEffect } from 'react'

export default function ClientYear() {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <span suppressHydrationWarning>
      {year || new Date().getFullYear()}
    </span>
  )
} 