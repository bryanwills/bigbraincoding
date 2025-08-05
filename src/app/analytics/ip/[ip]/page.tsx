'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Download, FileText, BarChart3, Clock, Globe, User, Activity } from 'lucide-react';
import { IPAnalytics, NGINXLogEntry } from '@/lib/nginxLogParser';
import { formatDuration, formatDate, exportIPAnalyticsToCSV, exportIPAnalyticsToXLSX, exportIPLogsToCSV, exportIPLogsToXLSX, downloadCSV } from '@/lib/exportUtils';

export default function IPAnalyticsPage() {
  const params = useParams();
  const ipAddress = params?.ip as string;

  const [analytics, setAnalytics] = useState<IPAnalytics | null>(null);
  const [logs, setLogs] = useState<NGINXLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs'>('analytics');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const fetchIPAnalytics = useCallback(async () => {
    if (!ipAddress) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/ip-analytics?ip=${ipAddress}`);
      if (!response.ok) throw new Error('Failed to fetch IP analytics');
      const data = await response.json();
      console.log('IP Analytics API Response:', data); // Debug log
      if (!data) {
        setError('No analytics data found for this IP address');
        return;
      }
      // Ensure sessionDetails is always an array
      if (data && typeof data === 'object') {
        if (!Array.isArray(data.sessionDetails)) {
          console.warn('sessionDetails is not an array:', data.sessionDetails);
          data.sessionDetails = [];
        }
      }
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching IP analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [ipAddress]);

  const fetchIPLogs = useCallback(async () => {
    if (!ipAddress) return;
    try {
      const response = await fetch(`/api/analytics/ip-logs?ip=${ipAddress}`);
      if (!response.ok) throw new Error('Failed to fetch IP logs');
      const data = await response.json();
      console.log('IP Logs API Response:', data); // Debug log

      // The API returns an object with 'entries' property, not a direct array
      if (data && data.entries && Array.isArray(data.entries)) {
        setLogs(data.entries);
      } else {
        console.warn('IP Logs API returned invalid data:', data);
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching IP logs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [ipAddress]);

  useEffect(() => {
    fetchIPAnalytics();
    fetchIPLogs();
  }, [fetchIPAnalytics, fetchIPLogs]);

  if (!ipAddress) {
    return (
      <div className="p-8 text-center text-gray-600">
        IP address not found
      </div>
    );
  }

  const handleExportAnalytics = async (format: 'csv' | 'xlsx') => {
    if (!analytics) return;

    setExportLoading(`analytics-${format}`);

    try {
      if (format === 'csv') {
        const csvContent = exportIPAnalyticsToCSV(analytics);
        downloadCSV(csvContent, `ip-analytics-${ipAddress}-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        exportIPAnalyticsToXLSX(analytics);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportLogs = async (format: 'csv' | 'xlsx') => {
    if (logs.length === 0) return;

    setExportLoading(`logs-${format}`);

    try {
      if (format === 'csv') {
        const csvContent = exportIPLogsToCSV(logs, ipAddress);
        downloadCSV(csvContent, `ip-logs-${ipAddress}-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        exportIPLogsToXLSX(logs, ipAddress);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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
            No analytics data found for IP address {ipAddress}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">IP Analytics: {ipAddress}</h1>
          <Badge className={getEngagementColor(analytics.engagementScore || 0)}>
            {analytics.engagementScore || 0}% Engagement
          </Badge>
        </div>
        <div className="flex gap-2">
          <a
            href="/analytics"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            Back to Analytics
          </a>
          <a
            href="/analytics/fingerprint"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Fingerprint Data
          </a>
          <Button
            onClick={() => handleExportAnalytics('csv')}
            disabled={exportLoading === 'analytics-csv'}
            variant="outline"
          >
            {exportLoading === 'analytics-csv' ? 'Exporting...' : 'Export Analytics CSV'}
          </Button>
          <Button
            onClick={() => handleExportAnalytics('xlsx')}
            disabled={exportLoading === 'analytics-xlsx'}
            variant="outline"
          >
            {exportLoading === 'analytics-xlsx' ? 'Exporting...' : 'Export Analytics XLSX'}
          </Button>
        </div>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <Button
              onClick={() => setDateRange({
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              })}
              variant="outline"
            >
              Last 7 Days
            </Button>
            <Button
              onClick={() => setDateRange({
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              })}
              variant="outline"
            >
              Last 30 Days
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisits || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Time on Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics.averageTimeOnSite || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagementScore || 0}%</div>
            <Progress value={analytics.engagementScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Visit Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">First Visit:</span>
                  <div className="font-medium">{formatDate(analytics.firstVisit)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Last Visit:</span>
                  <div className="font-medium">{formatDate(analytics.lastVisit)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device & Browser</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const devices = analytics.devices;
                    const browsers = analytics.browsers;

                    console.log('Devices:', devices); // Debug log
                    console.log('Browsers:', browsers); // Debug log

                    return (
                      <>
                        {devices && typeof devices === 'object' && Object.entries(devices).map(([device, count]) => (
                          <div key={device} className="flex justify-between">
                            <span>{device}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                        {browsers && typeof browsers === 'object' && Object.entries(browsers).map(([browser, count]) => (
                          <div key={browser} className="flex justify-between">
                            <span>{browser}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pages Visited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const pages = analytics.pages;
                  console.log('Pages:', pages); // Debug log

                  if (!pages || typeof pages !== 'object') {
                    console.warn('pages is not an object:', pages);
                    return <div className="text-gray-600">No page data available</div>;
                  }

                  return Object.entries(pages)
                    .sort(([, a], [, b]) => b - a)
                    .map(([page, count]) => (
                      <div key={page} className="flex justify-between items-center">
                        <span className="font-medium">{page}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={((count || 0) / (analytics.totalVisits || 1)) * 100} className="w-24" />
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const sessionDetails = analytics.sessionDetails;
                  console.log('Session Details:', sessionDetails); // Debug log

                  if (!sessionDetails || !Array.isArray(sessionDetails)) {
                    console.warn('sessionDetails is not an array:', sessionDetails);
                    return <div className="text-gray-600">No session details available</div>;
                  }

                  return sessionDetails.map((session, index) => (
                    <div key={session.sessionId || index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Session {index + 1}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.startTime)} - {formatDate(session.endTime)}
                          </p>
                        </div>
                        <Badge variant="outline">{formatDuration(session.duration)}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {session.totalRequests} requests
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(session.pages || []).map((page, pageIndex) => (
                          <Badge key={pageIndex} variant="secondary" className="text-xs">
                            {page}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Logs ({logs.length} entries)
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExportLogs('csv')}
                    disabled={exportLoading === 'logs-csv'}
                    size="sm"
                    variant="outline"
                  >
                    {exportLoading === 'logs-csv' ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  <Button
                    onClick={() => handleExportLogs('xlsx')}
                    disabled={exportLoading === 'logs-xlsx'}
                    size="sm"
                    variant="outline"
                  >
                    {exportLoading === 'logs-xlsx' ? 'Exporting...' : 'Export XLSX'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {(() => {
                  console.log('Logs data:', logs); // Debug log

                  if (!logs || !Array.isArray(logs)) {
                    console.warn('logs is not an array:', logs);
                    return <div className="text-gray-600">No logs available</div>;
                  }

                  return logs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((log, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs">{formatDate(log.timestamp)}</span>
                        <Badge variant={log.statusCode >= 400 ? 'destructive' : 'default'}>
                          {log.statusCode}
                        </Badge>
                      </div>
                      <div className="font-medium">{log.method} {log.path}</div>
                      <div className="text-xs text-gray-600 truncate">{log.userAgent}</div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">IP Address:</span>
                  <div className="font-mono">{analytics.ipAddress}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Requests:</span>
                  <div>{analytics.totalVisits}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Unique Sessions:</span>
                  <div>{analytics.sessions}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Average Session Duration:</span>
                  <div>{formatDuration(analytics.averageTimeOnSite)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}