'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CONTACT_INFO } from '@/lib/constants'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Mail, Phone, Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import SocialIcons from '@/components/shared/SocialIcons'

export default function Contact() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl"
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Start Your Project?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Let's discuss how we can bring your ideas to life with modern technology
            </p>
          </motion.div>

          {/* Contact Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {/* Contact Information */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>Get in Touch</span>
                  </CardTitle>
                  <CardDescription>
                    We'd love to hear about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">General Inquiries</h4>
                    <a
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="text-primary hover:underline"
                    >
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold">Support</h4>
                    <a
                      href={`mailto:${CONTACT_INFO.support}`}
                      className="text-primary hover:underline"
                    >
                      {CONTACT_INFO.support}
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold">Sales</h4>
                    <a
                      href={`mailto:${CONTACT_INFO.sales}`}
                      className="text-primary hover:underline"
                    >
                      {CONTACT_INFO.sales}
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Business Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {CONTACT_INFO.hours}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {CONTACT_INFO.responseTime}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form Preview */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>Quick Message</span>
                  </CardTitle>
                  <CardDescription>
                    Tell us about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      suppressHydrationWarning={true}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      suppressHydrationWarning={true}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      placeholder="Tell us about your project..."
                      rows={4}
                      suppressHydrationWarning={true}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <Button className="w-full">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex justify-center">
              <SocialIcons size={24} />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <Button asChild size="lg">
              <Link href="/contact">
                Get Started Today
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}