'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  MousePointer,
  Scroll,
  Type,
  Activity,
  Fingerprint,
  MapPin
} from 'lucide-react';

interface FingerprintEntry {
  timestamp: string;
  visitorId: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  deviceType: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cpuCores: number;
  memorySize: number;
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string;
  plugins: string;
  sessionId: string;
  pageUrl: string;
  referrer: string;
  timeOnPage: number;
  scrollDepth: number;
  clicks: number;
  scrolls: number;
  formInteractions: number;
}

interface FingerprintAnalytics {
  totalVisitors: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageTimeOnSite: number;
  averageScrollDepth: number;
  browsers: Record<string, number>;
  devices: Record<string, number>;
  timezones: Record<string, number>;
  languages: Record<string, number>;
  platforms: Record<string, number>;
  screenResolutions: Record<string, number>;
  topPages: Record<string, number>;
  topReferrers: Record<string, number>;
  interactionStats: {
    averageClicks: number;
    averageScrolls: number;
    averageFormInteractions: number;
  };
  recentVisitors: FingerprintEntry[];
}

export default function FingerprintAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<FingerprintAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFingerprintAnalytics();
  }, []);

  const fetchFingerprintAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/fingerprint');
      if (!response.ok) throw new Error('Failed to fetch fingerprint analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching fingerprint analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-4 text-red-600">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-4 text-gray-600">
            No fingerprint analytics data available
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fingerprint Analytics</h1>
          <p className="text-gray-600">Advanced visitor tracking and behavioral analytics</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/analytics"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            ← Back to Analytics
          </a>
          <Button onClick={fetchFingerprintAnalytics} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.uniqueVisitors} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Average {Math.round(analytics.averageTimeOnSite / 1000)}s per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Site</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageTimeOnSite / 1000)}s</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.averageScrollDepth)}% scroll depth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.interactionStats.averageClicks)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.interactionStats.averageScrolls)} scrolls, {Math.round(analytics.interactionStats.averageFormInteractions)} forms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="browsers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browsers">Browsers</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="ips">IP Addresses</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="fingerprint">Browser Fingerprint</TabsTrigger>
          <TabsTrigger value="sessions">Session Analytics</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="recent">Recent Visitors</TabsTrigger>
        </TabsList>

        <TabsContent value="browsers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Browser Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.browsers)
                  .sort(([, a], [, b]) => b - a)
                  .map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="text-sm">{browser}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.devices)
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{device}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Timezones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.timezones)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([timezone, count]) => (
                      <div key={timezone} className="flex items-center justify-between">
                        <span className="text-sm">{timezone}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.languages)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([language, count]) => (
                      <div key={language} className="flex items-center justify-between">
                        <span className="text-sm">{language}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                IP Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentVisitors
                  .filter((visitor, index, self) =>
                    self.findIndex(v => v.ipAddress === visitor.ipAddress) === index
                  )
                  .slice(0, 20)
                  .map((visitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{visitor.ipAddress}</Badge>
                        <span className="text-sm text-muted-foreground">{visitor.browser}</span>
                        <span className="text-sm text-muted-foreground">{visitor.deviceType}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(visitor.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  CPU Cores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.cpuCores === visitor.cpuCores) === index
                    )
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{visitor.cpuCores} cores</span>
                        <span className="text-xs text-gray-500">{visitor.platform}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Memory Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.memorySize === visitor.memorySize) === index
                    )
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{(visitor.memorySize / 1024 / 1024).toFixed(1)} GB</span>
                        <span className="text-xs text-gray-500">{visitor.platform}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Screen Resolutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.screenResolution === visitor.screenResolution) === index
                    )
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{visitor.screenResolution}</span>
                        <span className="text-xs text-gray-500">{visitor.deviceType}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fingerprint" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Fonts Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.fonts === visitor.fonts) === index
                    )
                    .slice(0, 5)
                    .map((visitor, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="text-sm font-medium mb-1">Fonts: {visitor.fonts.split(',').length} available</div>
                        <div className="text-xs text-gray-500 truncate">{visitor.fonts}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Plugins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.plugins === visitor.plugins) === index
                    )
                    .slice(0, 5)
                    .map((visitor, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="text-sm font-medium mb-1">Plugins: {visitor.plugins.split(',').length} available</div>
                        <div className="text-xs text-gray-500 truncate">{visitor.plugins}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  WebGL Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.webgl === visitor.webgl) === index
                    )
                    .slice(0, 5)
                    .map((visitor, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="text-sm font-medium mb-1">WebGL: {visitor.webgl}</div>
                        <div className="text-xs text-gray-500">Audio: {visitor.audio} Hz</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Canvas Fingerprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .slice(0, 3)
                    .map((visitor, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="text-sm font-medium mb-1">Canvas Hash</div>
                        <div className="text-xs text-gray-500 break-all">
                          {visitor.canvas.substring(0, 50)}...
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time on Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{(visitor.timeOnPage / 1000).toFixed(1)}s</span>
                        <span className="text-xs text-gray-500">{visitor.pageUrl.split('/').pop()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Click Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{visitor.clicks} clicks</span>
                        <span className="text-xs text-gray-500">{visitor.pageUrl.split('/').pop()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5" />
                  Scroll Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{visitor.scrolls} scrolls</span>
                        <span className="text-xs text-gray-500">{visitor.pageUrl.split('/').pop()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5" />
                  Scroll Depth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{visitor.scrollDepth}%</span>
                        <span className="text-xs text-gray-500">{visitor.pageUrl.split('/').pop()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Form Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{visitor.formInteractions} interactions</span>
                        <span className="text-xs text-gray-500">{visitor.pageUrl.split('/').pop()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Session IDs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentVisitors
                    .filter((visitor, index, self) =>
                      self.findIndex(v => v.sessionId === visitor.sessionId) === index
                    )
                    .slice(0, 10)
                    .map((visitor, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="text-sm font-medium mb-1">Session</div>
                        <div className="text-xs text-gray-500 break-all">{visitor.sessionId}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Most Visited Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.topPages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 15)
                  .map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between">
                      <span className="text-sm truncate">{page}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Recent Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentVisitors.slice(0, 10).map((visitor, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{visitor.deviceType}</Badge>
                        <Badge variant="outline">{visitor.browser}</Badge>
                        <span className="text-sm text-muted-foreground">{visitor.ipAddress}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(visitor.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p><strong>Page:</strong> {visitor.pageUrl}</p>
                      <p><strong>Session:</strong> {visitor.sessionId}</p>
                      <p><strong>Time on Page:</strong> {Math.round(visitor.timeOnPage / 1000)}s</p>
                      <p><strong>Interactions:</strong> {visitor.clicks} clicks, {visitor.scrolls} scrolls</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}