import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services - Big Brain Coding',
  description: 'Comprehensive software development services including website design, AI integration, custom applications, and hosting solutions.',
  keywords: ['web development', 'AI integration', 'custom applications', 'hosting', 'software development'],
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}