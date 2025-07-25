'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Brain, Users, Target, Award, Heart, Zap, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

const values = [
  {
    icon: Heart,
    title: 'Passion for Innovation',
    description: 'We\'re passionate about creating innovative solutions that solve real-world problems.'
  },
  {
    icon: Target,
    title: 'Excellence in Delivery',
    description: 'We strive for excellence in every project, delivering high-quality solutions on time.'
  },
  {
    icon: Users,
    title: 'Client-Centric Approach',
    description: 'Your success is our success. We work closely with you to understand your needs.'
  },
  {
    icon: Shield,
    title: 'Quality & Security',
    description: 'We prioritize quality and security in every line of code we write.'
  },
  {
    icon: Zap,
    title: 'Fast & Efficient',
    description: 'We deliver results quickly without compromising on quality or attention to detail.'
  },
  {
    icon: Globe,
    title: 'Modern Technology',
    description: 'We use cutting-edge technologies to build scalable, future-proof solutions.'
  }
]

const teamMembers = [
  {
    name: 'Bryan Wills',
    role: 'Founder & Lead Developer',
    bio: 'Passionate about creating innovative software solutions that make a difference. Specializes in AI integration and modern web technologies.',
    skills: ['Next.js', 'React', 'TypeScript', 'AI/ML', 'Node.js'],
    image: '/images/team/bryan.jpg'
  }
]

const milestones = [
  {
    id: 'company-founded',
    year: '2024',
    title: 'Company Founded',
    description: 'Big Brain Coding was established with a vision to create innovative software solutions.'
  },
  {
    id: 'first-projects',
    year: '2024',
    title: 'First Projects',
    description: 'Successfully launched our first projects including NutriSync, MindMate, and AccessiView.'
  },
  {
    id: 'technology-stack',
    year: '2024',
    title: 'Technology Stack',
    description: 'Established our modern technology stack with Next.js, TypeScript, and AI integration.'
  },
  {
    id: 'future-growth',
    year: '2025',
    title: 'Future Growth',
    description: 'Expanding our services and team to serve more clients with innovative solutions.'
  }
]

export default function AboutPage() {
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
              About Big Brain Coding
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              We're a passionate team of developers dedicated to creating innovative software solutions
              that solve real-world problems and drive business growth.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Big Brain Coding, our mission is to empower businesses and individuals with innovative
                software solutions that leverage cutting-edge technology. We believe that great software
                should be accessible, intuitive, and impactful.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We specialize in creating modern web applications, AI-powered solutions, and custom
                software that helps our clients achieve their goals and stay ahead of the competition.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/projects">
                    View Our Work
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    Get in Touch
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Brain className="h-32 w-32 text-primary" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
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
              Our Values
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              The principles that guide everything we do
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {values.map((value, index) => {
              const IconComponent = value.icon

              return (
                <motion.div
                  key={value.title}
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
                        <CardTitle className="text-xl">{value.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet Our Team
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              The passionate individuals behind our innovative solutions
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg shadow-glow-hover">
                  <CardHeader>
                    <div className="text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                        <Users className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <CardDescription className="text-base">{member.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
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
              Our Journey
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              Key milestones in our company's growth
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-primary/20"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  variants={fadeInUp}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>

                  {/* Content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="transition-all duration-200 hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm font-semibold text-primary">
                          {milestone.year}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
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
              Ready to Work Together?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Let's discuss how we can help bring your ideas to life with our innovative approach and modern technology.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg">
                <Link href="/contact">
                  Start a Project
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/services">
                  View Services
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}