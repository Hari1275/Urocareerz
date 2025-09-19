import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string consistently to avoid hydration mismatches
 * Uses a consistent format that works on both server and client
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  // Use a consistent format that doesn't depend on locale/timezone
  const year = date.getFullYear()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  const day = date.getDate()

  return `${day} ${month} ${year}`
}

/**
 * Format a date string with time consistently
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  const year = date.getFullYear()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`
}
