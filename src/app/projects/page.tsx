'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PROJECTS } from '@/lib/constants'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { ExternalLink, Github, Calendar, Clock, Users, Target } from 'lucide-react'
import Link from 'next/link'

const projectStats = [
  {
    icon: Target,
    value: '3',
    label: 'Active Projects',
    description: 'Innovative solutions in development'
  },
  {
    icon: Users,
    value: '100%',
    label: 'Client Satisfaction',
    description: 'Delivering exceptional results'
  },
  {
    icon: Clock,
    value: '< 2 weeks',
    label: 'Average Delivery',
    description: 'Fast and efficient development'
  },
  {
    icon: Calendar,
    value: '24/7',
    label: 'Support Available',
    description: 'Ongoing maintenance and support'
  }
]

export default function ProjectsPage() {
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
              Our Projects
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              Discover our innovative solutions that are changing the way people interact with technology.
              Each project represents our commitment to excellence and innovation.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {projectStats.map((stat) => {
              const IconComponent = stat.icon

              return (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <h3 className="text-lg font-semibold">{stat.label}</h3>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-12 lg:grid-cols-2"
          >
            {PROJECTS.map((project) => (
              <motion.div
                key={project.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg shadow-glow-hover">
                  {/* Project Image Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary/60 mb-4">
                        {project.name.charAt(0)}
                      </div>
                      <p className="text-lg text-muted-foreground max-w-md">
                        {project.shortDescription}
                      </p>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{project.name}</CardTitle>
                        <CardDescription className="mt-2 text-base">
                          {project.description}
                        </CardDescription>
                      </div>
                      <Badge variant={project.status === 'development' ? 'secondary' : 'default'}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Technologies */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Key Features</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {project.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Case Study Details */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold mb-3">Project Overview</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Challenge</h5>
                          <p className="text-sm mt-1">
                            Creating innovative solutions that address real-world problems through modern technology.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Solution</h5>
                          <p className="text-sm mt-1">
                            Leveraging cutting-edge technologies to build scalable, user-friendly applications.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Impact</h5>
                          <p className="text-sm mt-1">
                            Improving user experience and efficiency through intelligent automation and AI integration.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Results</h5>
                          <p className="text-sm mt-1">
                            Delivering high-quality solutions that exceed client expectations and drive business growth.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button asChild className="flex-1">
                        <Link href={`/projects#${project.id}`}>
                          View Details
                        </Link>
                      </Button>
                      {project.githubUrl && (
                        <Button variant="outline" asChild>
                          <Link href={project.githubUrl} target="_blank">
                            <Github className="h-4 w-4 mr-2" />
                            Code
                          </Link>
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button variant="outline" asChild>
                          <Link href={project.liveUrl} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Live Demo
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Our Development Process
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground"
            >
              We follow a systematic approach to deliver exceptional results
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Research & Planning</h3>
                <p className="text-muted-foreground">
                  We thoroughly research your requirements and create a detailed project plan with clear milestones.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Design & Development</h3>
                <p className="text-muted-foreground">
                  Our team builds your solution using modern technologies and best practices.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Testing & Deployment</h3>
                <p className="text-muted-foreground">
                  We rigorously test your solution and deploy it with ongoing support and maintenance.
                </p>
              </div>
            </motion.div>
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
              Let&apos;s discuss how we can bring your ideas to life with the same level of innovation and quality.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg">
                <Link href="/contact">
                  Start Your Project
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