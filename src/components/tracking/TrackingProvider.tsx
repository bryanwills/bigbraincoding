'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initTracking, trackEvent } from '@/lib/tracking'

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize tracking on first load
    initTracking()
  }, [])

  useEffect(() => {
    // Track page changes
    if (pathname) {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        trackEvent('page_change', {
          pathname,
          fullUrl: window.location.href
        })
      }, 100)
    }
  }, [pathname])

  return <>{children}</>
}