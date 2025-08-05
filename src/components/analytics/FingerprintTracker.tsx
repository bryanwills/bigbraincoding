'use client';

import { useEffect } from 'react';
import { initializeFingerprintTracking } from '@/lib/fingerprintTracker';

export default function FingerprintTracker() {
  useEffect(() => {
    // Initialize fingerprint tracking when the component mounts
    initializeFingerprintTracking();
  }, []);

  // This component doesn't render anything visible
  return null;
}