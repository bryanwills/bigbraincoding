import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import TrackingProvider from "@/components/tracking/TrackingProvider";
import { Analytics } from "@vercel/analytics/next";
import {
  ConsentManagerDialog,
  ConsentManagerProvider,
  CookieBanner,
} from '@c15t/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Big Brain Coding - Modern Software Development",
  description: "A software development company specializing in modern web technologies, AI integration, and custom application development.",
  keywords: ["software development", "web design", "AI integration", "Next.js", "React", "TypeScript"],
  authors: [{ name: "Big Brain Coding" }],
  creator: "Big Brain Coding",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bigbraincoding.com",
    title: "Big Brain Coding - Modern Software Development",
    description: "A software development company specializing in modern web technologies, AI integration, and custom application development.",
    siteName: "Big Brain Coding",
  },
  twitter: {
    card: "summary_large_image",
    title: "Big Brain Coding - Modern Software Development",
    description: "A software development company specializing in modern web technologies, AI integration, and custom application development.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Head content will be handled by Next.js */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConsentManagerProvider
            options={{
              mode: 'c15t',
              backendURL: 'https://bryan-wills-111n91xb-europe-onboarding.c15t.dev',
            }}
          >
            <TrackingProvider>
              <ConsentManagerDialog />
              <CookieBanner />
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <ThemeToggle />
              </div>
            </TrackingProvider>
          </ConsentManagerProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
