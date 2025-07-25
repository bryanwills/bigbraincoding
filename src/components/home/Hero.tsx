'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HERO_CTAS, PROJECTS } from '@/lib/constants'
import { getRandomItem } from '@/lib/utils'
import { fadeInUp, staggerContainer } from '@/lib/animations'

export default function Hero() {
  const [currentCTA, setCurrentCTA] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCTA((prev) => (prev + 1) % HERO_CTAS.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentHeroCTA = HERO_CTAS[currentCTA]
  const currentProject = PROJECTS.find(p => p.id === currentHeroCTA.projectId)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Modern Solutions for{' '}
            <span className="text-gradient">
              Modern Problems
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg text-muted-foreground sm:text-xl"
          >
            We build intelligent applications that solve real-world problems using cutting-edge technology.
          </motion.p>

          {/* Rotating CTA Section */}
          <motion.div
            variants={fadeInUp}
            className="mt-12"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCTA}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg border bg-card p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-primary">
                  {currentHeroCTA.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {currentHeroCTA.description}
                </p>
                <div className="mt-4 flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Button asChild size="lg">
                    <Link href={currentHeroCTA.ctaLink}>
                      {currentHeroCTA.ctaText}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/projects">
                      View All Projects
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* CTA Indicators */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex justify-center space-x-2"
          >
            {HERO_CTAS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCTA(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentCTA ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Innovative Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5+</div>
              <div className="text-sm text-muted-foreground">Core Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Modern Tech Stack</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl shadow-glow" />
        <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  )
}