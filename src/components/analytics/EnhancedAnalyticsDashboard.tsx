'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Activity,
  Globe,
  Server,
  BarChart3,
  Users,
  Clock,
  Download,
  Eye,
  MousePointer,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

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

interface NGINXLogSummary {
  totalRequests: number;
  uniqueIPs: string[];
  statusCodes: Record<number, number>;
  topPaths: Record<string, number>;
  topUserAgents: Record<string, number>;
  topReferers: Record<string, number>;
  averageResponseTime: number;
  totalBytesSent: number;
  timeRange: {
    start: string;
    end: string;
  };
}

interface AnalyticsData {
  nginx: {
    entries: NGINXLogEntry[];
    summary: NGINXLogSummary;
  };
  tracking: {
    entries: any[];
    summary: any;
  };
  marketing: {
    visitorProfiles: any[];
    salesIntelligence: any;
  };
}

export default function EnhancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<'nginx' | 'tracking' | 'marketing'>('nginx')
  const [selectedLogType, setSelectedLogType] = useState<'all' | 'access' | 'tracking' | 'ip_tracking'>('all')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedLogType, dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

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
      })

      // Fetch tracking data
      const trackingResponse = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange })
      })

      // Fetch marketing intelligence
      const marketingResponse = await fetch('/api/analytics/marketing-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange })
      })

      const nginxData = nginxResponse.ok ? await nginxResponse.json() : { entries: [], summary: {} }
      const trackingData = trackingResponse.ok ? await trackingResponse.json() : { entries: [], summary: {} }
      const marketingData = marketingResponse.ok ? await marketingResponse.json() : { visitorProfiles: [], salesIntelligence: {} }

      setAnalyticsData({
        nginx: nginxData,
        tracking: trackingData,
        marketing: marketingData
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600'
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600'
    if (statusCode >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics from multiple data sources
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedLogType} onValueChange={(value: any) => setSelectedLogType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select log type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="access">Access Logs</SelectItem>
              <SelectItem value="tracking">Tracking Logs</SelectItem>
              <SelectItem value="ip_tracking">IP Tracking Logs</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="nginx" className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>NGINX Logs</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center space-x-2">
            <MousePointer className="w-4 h-4" />
            <span>Tracking Data</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Marketing Intelligence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nginx" className="space-y-4">
          {analyticsData?.nginx && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.nginx.summary.totalRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedLogType === 'all' ? 'All log types' : `${selectedLogType} logs`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.nginx.summary.uniqueIPs.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Different IP addresses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(analyticsData.nginx.summary.averageResponseTime * 1000)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average request time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatBytes(analyticsData.nginx.summary.totalBytesSent)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total bytes sent
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                    <CardDescription>
                      Most requested pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.nginx.summary.topPaths)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([path, count]) => (
                          <div key={path} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="font-medium truncate">{path}</span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Codes</CardTitle>
                    <CardDescription>
                      HTTP response status distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.nginx.summary.statusCodes)
                        .sort(([, a], [, b]) => b - a)
                        .map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(parseInt(status))}`}></div>
                              <span className="font-medium">{status}</span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                  <CardDescription>
                    Latest NGINX log entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analyticsData.nginx.entries
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 20)
                      .map((entry, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <div>
                                <div className="font-medium">{entry.ipAddress}</div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.method} {entry.path}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${getStatusColor(entry.statusCode)}`}>
                                {entry.statusCode}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          {analyticsData?.tracking && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking Data</CardTitle>
                <CardDescription>
                  Custom tracking events and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Tracking data will be displayed here when available
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          {analyticsData?.marketing && (
            <Card>
              <CardHeader>
                <CardTitle>Marketing Intelligence</CardTitle>
                <CardDescription>
                  Lead qualification and sales intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Marketing intelligence data will be displayed here when available
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}