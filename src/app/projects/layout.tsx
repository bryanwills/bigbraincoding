import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects - Big Brain Coding',
  description: 'Explore our innovative projects including AI-powered applications, custom software solutions, and modern web applications.',
  keywords: ['projects', 'portfolio', 'AI applications', 'web development', 'software solutions'],
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}