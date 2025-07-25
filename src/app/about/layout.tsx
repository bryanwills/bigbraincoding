import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - Big Brain Coding',
  description: 'Learn about Big Brain Coding, our mission, values, and the team behind our innovative software development solutions.',
  keywords: ['about', 'company', 'team', 'mission', 'values', 'software development'],
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}