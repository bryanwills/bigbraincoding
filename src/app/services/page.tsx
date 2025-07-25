'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SERVICES } from '@/lib/constants'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Globe, Server, Brain, Smartphone, Puzzle, Check, Users, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Server,
  Brain,
  Smartphone,
  Puzzle,
  Zap,
}

const pricingPlans = [
  {
    name: 'Starter',
    price: '$2,500',
    description: 'Perfect for small businesses and startups',
    features: [
      'Responsive website design',
      'Basic SEO optimization',
      'Contact form integration',
      'Social media integration',
      '1 month of support',
      'Basic analytics setup'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '$5,000',
    description: 'Ideal for growing businesses',
    features: [
      'Everything in Starter',
      'Advanced SEO optimization',
      'Content management system',
      'E-commerce integration',
      '3 months of support',
      'Performance optimization',
      'Security hardening'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$10,000+',
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Professional',
      'Custom AI integration',
      'Advanced analytics',
      'Multi-language support',
      'API development',
      '6 months of support',
      'Priority support',
      'Custom features'
    ],
    popular: false
  }
]

export default function ServicesPage() {
  const processSteps = [
    {
      step: '01',
      title: 'Discovery & Planning',
      description: 'We understand your requirements and create a detailed project plan',
      icon: Users
    },
    {
      step: '02',
      title: 'Design & Development',
      description: 'Our team builds your solution with modern technologies',
      icon: Globe
    },
    {
      step: '03',
      title: 'Testing & Quality Assurance',
      description: 'Rigorous testing ensures your solution works perfectly',
      icon: Shield
    },
    {
      step: '04',
      title: 'Deployment & Support',
      description: 'We launch your project and provide ongoing support',
      icon: Server
    }
  ]
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold tracking-tight sm:text-6xl"
            >
              Our Services
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              We offer comprehensive software development solutions tailored to your needs.
              From simple websites to complex AI-powered applications, we&apos;ve got you covered.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
                                    {SERVICES.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Globe

              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full transition-all duration-200 hover:shadow-lg shadow-glow-hover">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{service.name}</CardTitle>
                          <CardDescription className="mt-2">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full mt-6">
                        <Link href="/contact">
                          Get Started
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Our Process
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              We follow a proven methodology to deliver exceptional results
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {processSteps.map((step, index) => {
              const IconComponent = step.icon || Globe

              return (
                <motion.div
                  key={step.step}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{step.step}</div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Pricing Plans
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              Choose the perfect plan for your business needs
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'border-primary shadow-glow' : ''
                }`}>
                  <CardHeader>
                    <div className="text-center">
                      {plan.popular && (
                        <Badge className="mb-4" variant="default">
                          Most Popular
                        </Badge>
                      )}
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/project</span>
                      </div>
                      <CardDescription className="mt-2">
                        {plan.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full mt-6">
                      <Link href="/contact">
                        Get Started
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Ready to Start Your Project?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Let&apos;s discuss how we can bring your ideas to life with modern technology and innovative solutions.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg">
                <Link href="/contact">
                  Get a Free Quote
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/projects">
                  View Our Work
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}