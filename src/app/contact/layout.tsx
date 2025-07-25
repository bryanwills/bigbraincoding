import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - Big Brain Coding',
  description: 'Get in touch with Big Brain Coding for your software development needs. We\'re here to help bring your ideas to life.',
  keywords: ['contact', 'get quote', 'software development', 'web design', 'AI integration'],
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}