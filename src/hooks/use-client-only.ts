import { useState, useEffect } from 'react'

/**
 * Hook to ensure a component only renders on the client side
 * This prevents hydration mismatches by ensuring consistent rendering
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely access browser APIs without causing hydration mismatches
 * Returns undefined during SSR and the actual value on the client
 */
export function useBrowserAPI<T>(
  getValue: () => T,
  defaultValue: T
): T {
  const [value, setValue] = useState<T>(defaultValue)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setValue(getValue())
  }, [getValue])

  return isClient ? value : defaultValue
}

/**
 * Hook to safely access window dimensions without hydration mismatches
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return isClient ? size : { width: 0, height: 0 }
}

/**
 * Hook to safely access localStorage without hydration mismatches
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setValue(JSON.parse(item))
      }
    } catch (error) {
      console.error('Error reading localStorage key:', key, error)
    }
  }, [key])

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue)
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(newValue))
      }
    } catch (error) {
      console.error('Error setting localStorage key:', key, error)
    }
  }

  return [value, setStoredValue] as const
} 