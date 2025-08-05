'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IPAnalytics, SessionDetail, NGINXLogEntry } from '@/lib/nginxLogParser';
import { formatDuration, formatDate, exportIPAnalyticsToCSV, exportIPLogsToCSV, downloadCSV } from '@/lib/exportUtils';

interface IPDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipAddress: string;
  dateRange: { start: string; end: string };
}

export default function IPDetailsModal({ isOpen, onClose, ipAddress, dateRange }: IPDetailsModalProps) {
  const [analytics, setAnalytics] = useState<IPAnalytics | null>(null);
  const [logs, setLogs] = useState<NGINXLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && ipAddress) {
      fetchIPAnalytics();
      fetchIPLogs();
    }
  }, [isOpen, ipAddress, dateRange]);

  const fetchIPAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/ip-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress,
          dateRange
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch IP analytics');
      }

      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchIPLogs = async () => {
    try {
      const response = await fetch('/api/analytics/ip-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress,
          dateRange
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLogs(data.entries);
      }
    } catch (err) {
      console.error('Error fetching IP logs:', err);
    }
  };

  const handleExportAnalytics = () => {
    if (!analytics) return;

    const csvContent = exportIPAnalyticsToCSV(analytics);
    downloadCSV(csvContent, `ip-analytics-${ipAddress}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportLogs = () => {
    if (logs.length === 0) return;

    const csvContent = exportIPLogsToCSV(logs, ipAddress);
    downloadCSV(csvContent, `ip-logs-${ipAddress}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading IP Analytics...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-red-600">
            {error}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!analytics) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>No Data Found</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-gray-600">
            No analytics data found for IP address {ipAddress}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>IP Analytics: {ipAddress}</span>
              <Badge className={getEngagementColor(analytics.engagementScore)}>
                {analytics.engagementScore}% Engagement
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportAnalytics} size="sm">
                Export Analytics
              </Button>
              <Button onClick={handleExportLogs} size="sm" variant="outline">
                Export Logs
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVisits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.sessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Time on Site</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.averageTimeOnSite)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.engagementScore}%</div>
              <Progress value={analytics.engagementScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
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

                      console.log('IPDetailsModal Devices:', devices); // Debug log
                      console.log('IPDetailsModal Browsers:', browsers); // Debug log

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
                    console.log('IPDetailsModal Pages:', pages); // Debug log

                    if (!pages || typeof pages !== 'object') {
                      console.warn('IPDetailsModal pages is not an object:', pages);
                      return <div className="text-gray-600">No page data available</div>;
                    }

                    return Object.entries(pages)
                      .sort(([, a], [, b]) => b - a)
                      .map(([page, count]) => (
                        <div key={page} className="flex justify-between items-center">
                          <span className="font-medium">{page}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(count / analytics.totalVisits) * 100} className="w-24" />
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
                    console.log('IPDetailsModal Session Details:', sessionDetails); // Debug log

                    if (!sessionDetails || !Array.isArray(sessionDetails)) {
                      console.warn('IPDetailsModal sessionDetails is not an array:', sessionDetails);
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
                <CardTitle>All Logs ({logs.length} entries)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {(() => {
                    console.log('IPDetailsModal Logs data:', logs); // Debug log

                    if (!logs || !Array.isArray(logs)) {
                      console.warn('IPDetailsModal logs is not an array:', logs);
                      return <div className="text-gray-600">No logs available</div>;
                    }

                    return logs.map((log, index) => (
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
      </DialogContent>
    </Dialog>
  );
}