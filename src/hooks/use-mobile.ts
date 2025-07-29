import { useBrowserAPI } from './use-client-only'

export function useMobile(breakpoint: number = 768): boolean {
  const isMobile = useBrowserAPI(
    () => window.innerWidth < breakpoint,
    false
  )

  return isMobile
}

// Alias for compatibility
export const useIsMobile = useMobile; 