import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UpdateBanner from "@/components/shared/UpdateBanner";
import {
  ConsentManagerDialog,
  ConsentManagerProvider,
  CookieBanner,
} from '@c15t/react';
import FingerprintTracker from "@/components/analytics/FingerprintTracker";

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
  icons: {
    icon: [
      { url: '/brain-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: '/brain-favicon.svg',
    apple: '/brain-favicon.svg'
  },
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
        <Script
          defer
          data-domain="bigbraincoding.com"
          src="https://plausible.bryanwills.dev/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
        />
        <Script id="plausible-init">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
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
            <ConsentManagerDialog />
            <CookieBanner />
            <UpdateBanner />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <ThemeToggle />
              <FingerprintTracker />
            </div>
          </ConsentManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
