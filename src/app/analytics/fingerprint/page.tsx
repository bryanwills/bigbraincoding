import FingerprintAnalyticsDashboard from '@/components/analytics/FingerprintAnalyticsDashboard';

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';

export default function FingerprintPage() {
  return <FingerprintAnalyticsDashboard />;
}