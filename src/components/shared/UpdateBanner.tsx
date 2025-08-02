'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BANNER_KEY = 'update-banner-dismissed'
const BANNER_DELAY = 2000 // 2 seconds delay

export default function UpdateBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed within last 24 hours
    const dismissedTime = localStorage.getItem(BANNER_KEY)
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (!dismissedTime || (now - parseInt(dismissedTime)) > twentyFourHours) {
      // Show banner after delay
      const timer = setTimeout(() => {
        setIsVisible(true)
        // Set CSS custom property for header positioning
        document.documentElement.style.setProperty('--banner-height', '60px')
      }, BANNER_DELAY)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(BANNER_KEY, Date.now().toString())
  }

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pt-4"
          data-banner-visible="true"
        >
          <div className="flex items-center space-x-4 px-6 py-4 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90 border border-primary/20 rounded-lg shadow-lg">
            <Bell className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                            <p className="text-sm text-primary-foreground whitespace-nowrap">
                  🚀&nbsp;We&apos;re building exciting products to bring convenience to your everyday tasks. Check back frequently for updates!
                </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10 p-0 flex-shrink-0"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Dismiss banner</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}