'use client'

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UniqueIPsList from './UniqueIPsList';

interface AnalyticsData {
  nginx: {
    entries: NGINXLogEntry[];
    summary: {
      totalRequests: number;
      uniqueIPs: string[];
      uniqueIPsWithCounts?: UniqueIPSummary[];
      statusCodes: Record<number, number>;
      topPaths: Record<string, number>;
      filteredPages?: Record<string, number>;
      topUserAgents: Record<string, number>;
      topReferers: Record<string, number>;
      averageResponseTime: number;
      totalBytesSent: number;
      timeRange: {
        start: string;
        end: string;
      };
      humanIPs?: UniqueIPSummary[];
      botIPs?: UniqueIPSummary[];
    };
  };
  tracking: {
    summary: unknown[];
    events: unknown[];
    totalVisitors: number;
    totalSessions: number;
    totalPageViews: number;
  };
  marketing: {
    visitorProfiles: unknown[];
    salesIntelligence: unknown;
  };
}

interface NGINXLogEntry {
  timestamp: string;
  ipAddress: string;
  method: string;
  path: string;
  statusCode: number;
  bytesSent: number;
  referer: string;
  userAgent: string;
  requestTime: number;
  upstreamResponseTime: number;
}

interface UniqueIPSummary {
  ipAddress: string;
  totalVisits: number;
  sessions: number;
  lastVisit: string;
  engagementScore: number;
}

export default function EnhancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'nginx' | 'tracking' | 'marketing'>('nginx');
  const [selectedLogType, setSelectedLogType] = useState<'all' | 'access' | 'tracking' | 'ip_tracking'>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // New state for IP analytics
  const [showUniqueIPsModal, setShowUniqueIPsModal] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch NGINX logs
      const nginxResponse = await fetch('/api/analytics/nginx-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logType: selectedLogType,
          dateRange
        })
      });

      // Fetch tracking data
      const trackingResponse = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange })
      });

      // Fetch marketing intelligence
      const marketingResponse = await fetch('/api/analytics/marketing-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange })
      });

      const nginxData = nginxResponse.ok ? await nginxResponse.json() : { entries: [], summary: {} };
      const trackingData = trackingResponse.ok ? await trackingResponse.json() : { entries: [], summary: {} };
      const marketingData = marketingResponse.ok ? await marketingResponse.json() : { visitorProfiles: [], salesIntelligence: {} };

      setAnalyticsData({
        nginx: nginxData,
        tracking: trackingData,
        marketing: marketingData
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLogType, dateRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleUniqueVisitorsClick = () => {
    setShowUniqueIPsModal(true);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-8 text-center text-gray-600">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as 'nginx' | 'tracking' | 'marketing')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nginx">NGINX</SelectItem>
              <SelectItem value="tracking">Tracking</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <a
            href="/analytics/fingerprint"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Fingerprint Analytics
          </a>

          {selectedPlatform === 'nginx' && (
            <Select value={selectedLogType} onValueChange={(value) => setSelectedLogType(value as 'all' | 'access' | 'tracking' | 'ip_tracking')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="access">Access</SelectItem>
                <SelectItem value="tracking">Tracking</SelectItem>
                <SelectItem value="ip_tracking">IP Tracking</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          />
          <span className="self-center">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* NGINX Analytics */}
      {selectedPlatform === 'nginx' && analyticsData.nginx && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.nginx.summary.totalRequests.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleUniqueVisitorsClick}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.nginx.summary.uniqueIPs.length}</div>
                <div className="text-xs text-gray-600 mt-1">Click to view details</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.nginx.summary.averageResponseTime.toFixed(2)}ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(analyticsData.nginx.summary.totalBytesSent)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="status">Status Codes</TabsTrigger>
              <TabsTrigger value="browsers">Browsers</TabsTrigger>
              <TabsTrigger value="referers">Referers</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages (Filtered)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(() => {
                      const filteredPages = analyticsData.nginx.summary.filteredPages;
                      console.log('EnhancedAnalyticsDashboard filteredPages:', filteredPages); // Debug log

                      if (!filteredPages || typeof filteredPages !== 'object') {
                        console.warn('EnhancedAnalyticsDashboard filteredPages is not an object:', filteredPages);
                        return <div className="text-gray-600">No page data available</div>;
                      }

                      return Object.entries(filteredPages)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 10)
                        .map(([page, count]) => (
                          <div key={page} className="flex justify-between items-center">
                            <span className="font-medium">{page}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={((count as number) / analyticsData.nginx.summary.totalRequests) * 100} className="w-24" />
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(() => {
                      const statusCodes = analyticsData.nginx.summary.statusCodes;
                      console.log('EnhancedAnalyticsDashboard statusCodes:', statusCodes); // Debug log

                      if (!statusCodes || typeof statusCodes !== 'object') {
                        console.warn('EnhancedAnalyticsDashboard statusCodes is not an object:', statusCodes);
                        return <div className="text-gray-600">No status code data available</div>;
                      }

                      return Object.entries(statusCodes)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([code, count]) => (
                          <div key={code} className="flex justify-between items-center">
                            <Badge variant={code.startsWith('2') ? 'default' : code.startsWith('4') ? 'destructive' : 'secondary'}>
                              {code}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Progress value={((count as number) / analyticsData.nginx.summary.totalRequests) * 100} className="w-24" />
                              <span>{count}</span>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="browsers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Browsers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(() => {
                      const topUserAgents = analyticsData.nginx.summary.topUserAgents;
                      console.log('EnhancedAnalyticsDashboard topUserAgents:', topUserAgents); // Debug log

                      if (!topUserAgents || typeof topUserAgents !== 'object') {
                        console.warn('EnhancedAnalyticsDashboard topUserAgents is not an object:', topUserAgents);
                        return <div className="text-gray-600">No browser data available</div>;
                      }

                      return Object.entries(topUserAgents)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([browser, count]) => (
                          <div key={browser} className="flex justify-between items-center">
                            <span className="font-medium">{browser}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={(count / analyticsData.nginx.summary.totalRequests) * 100} className="w-24" />
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Referers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(() => {
                      const topReferers = analyticsData.nginx.summary.topReferers;
                      console.log('EnhancedAnalyticsDashboard topReferers:', topReferers); // Debug log

                      if (!topReferers || typeof topReferers !== 'object') {
                        console.warn('EnhancedAnalyticsDashboard topReferers is not an object:', topReferers);
                        return <div className="text-gray-600">No referer data available</div>;
                      }

                      return Object.entries(topReferers)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([referer, count]) => (
                          <div key={referer} className="flex justify-between items-center">
                            <span className="font-medium">{referer || 'Direct'}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={(count / analyticsData.nginx.summary.totalRequests) * 100} className="w-24" />
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Unique IPs Modal */}
      <Dialog open={showUniqueIPsModal} onOpenChange={setShowUniqueIPsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unique Visitors Analytics</DialogTitle>
          </DialogHeader>
          {analyticsData.nginx.summary.uniqueIPsWithCounts && (
            <UniqueIPsList
              uniqueIPs={analyticsData.nginx.summary.uniqueIPsWithCounts}
              humanIPs={analyticsData.nginx.summary.humanIPs}
              botIPs={analyticsData.nginx.summary.botIPs}
              dateRange={dateRange}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}