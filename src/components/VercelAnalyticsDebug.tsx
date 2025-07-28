'use client'

import { useEffect } from 'react'

export default function VercelAnalyticsDebug() {
  useEffect(() => {
    // Check if Vercel Analytics script is loaded
    const checkVercelAnalytics = () => {
      const scripts = document.querySelectorAll('script')
      const vercelScript = Array.from(scripts).find(script =>
        script.src.includes('vercel') || script.src.includes('va')
      )

      if (vercelScript) {
        console.log('✅ Vercel Analytics script found:', vercelScript.src)
      } else {
        console.log('❌ Vercel Analytics script not found')
      }

      // Check for Vercel Analytics global object
      if ((window as any).va) {
        console.log('✅ Vercel Analytics global object found')
      } else {
        console.log('❌ Vercel Analytics global object not found')
      }
    }

    // Check after a short delay to allow scripts to load
    setTimeout(checkVercelAnalytics, 1000)
    setTimeout(checkVercelAnalytics, 3000)
  }, [])

  return null // This component doesn't render anything
}