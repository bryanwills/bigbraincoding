'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics() {
  useEffect(() => {
    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-KTE9D3466K';
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-KTE9D3466K');

    // Make gtag globally available
    window.gtag = gtag;
  }, []);

  return null;
}