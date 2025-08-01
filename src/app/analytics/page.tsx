'use client'

import { useEffect, useState } from 'react'

interface TrackingEvent {
  timestamp: string
  sessionId: string
  eventType: string
  pageUrl: string
  ipAddress: string
  userAgent: string
  deviceInfo: {
    browser: string
    deviceType: string
    screenWidth: number
    screenHeight: number
    language: string
  }
  timeOnPage?: number
  scrollDepth?: number
}

interface IPSummary {
  ip: string
  totalVisits: number
  uniqueSessions: number
  pages: { [key: string]: number }
  devices: { [key: string]: number }
  browsers: { [key: string]: number }
  averageTimeOnPage: number
  lastVisit: string
  firstVisit: string
}

interface AnalyticsData {
  summary: IPSummary[]
  events: TrackingEvent[]
  totalVisitors: number
  totalSessions: number
  totalPageViews: number
}

export default function AnalyticsPage() {
  const [realIP, setRealIP] = useState('unknown')
  const [allowedIP, setAllowedIP] = useState('')
  const [isAllowed, setIsAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedIP, setSelectedIP] = useState<string>('')
  const [dateRange, setDateRange] = useState('today')

  useEffect(() => {
    // Get IP from API
    fetch('/api/test-ip')
      .then(res => res.json())
      .then(data => {
        setRealIP(data.yourIP)
        setAllowedIP(data.allowedIP)
        setIsAllowed(data.isAllowed)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (isAllowed) {
      fetchAnalyticsData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, dateRange])

  const fetchAnalyticsData = async () => {
    try {
      // Convert dateRange to actual date
      let date;
      const today = new Date();

      switch (dateRange) {
        case 'today':
          date = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          date = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          // For now, just use today's date
          date = today.toISOString().split('T')[0];
          break;
        default:
          date = today.toISOString().split('T')[0];
      }

      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date })
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Check if user is accessing from allowed IP
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-muted-foreground">
              Analytics dashboard is only accessible from authorized IP addresses.
            </p>
            <p className="text-sm text-muted-foreground">
              Your IP: {realIP}
            </p>
            <p className="text-sm text-muted-foreground">
              Allowed IP: {allowedIP || 'Not set'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time visitor analytics and IP-based tracking data
          </p>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Access granted from authorized IP: {realIP}
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
          </select>
        </div>

        {analyticsData ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold">Total Visitors</h3>
                <p className="text-3xl font-bold">{analyticsData.totalVisitors}</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold">Total Sessions</h3>
                <p className="text-3xl font-bold">{analyticsData.totalSessions}</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold">Page Views</h3>
                <p className="text-3xl font-bold">{analyticsData.totalPageViews}</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold">Active IPs</h3>
                <p className="text-3xl font-bold">{analyticsData.summary.length}</p>
              </div>
            </div>

            {/* IP Address Summaries */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Visitor IP Addresses</h2>
              {analyticsData.summary.length === 0 ? (
                <p className="text-muted-foreground">No visitor data found for this date range.</p>
              ) : (
                <div className="space-y-4">
                  {analyticsData.summary.map((ipSummary) => (
                    <div key={ipSummary.ip} className="border rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{ipSummary.ip}</h3>
                        <button
                          onClick={() => setSelectedIP(selectedIP === ipSummary.ip ? '' : ipSummary.ip)}
                          className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded"
                        >
                          {selectedIP === ipSummary.ip ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Visits:</span>
                          <p className="font-semibold">{ipSummary.totalVisits}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unique Sessions:</span>
                          <p className="font-semibold">{ipSummary.uniqueSessions}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Time:</span>
                          <p className="font-semibold">{Math.round(ipSummary.averageTimeOnPage)}s</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Visit:</span>
                          <p className="font-semibold">{new Date(ipSummary.lastVisit).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {selectedIP === ipSummary.ip && (
                        <div className="mt-4 space-y-4">
                          {/* Pages Visited */}
                          <div>
                            <h4 className="font-semibold mb-2">Pages Visited:</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(ipSummary.pages).map(([page, count]) => (
                                <span key={page} className="bg-muted px-2 py-1 rounded text-sm">
                                  {page}: {count}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Devices */}
                          <div>
                            <h4 className="font-semibold mb-2">Devices:</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(ipSummary.devices).map(([device, count]) => (
                                <span key={device} className="bg-muted px-2 py-1 rounded text-sm">
                                  {device}: {count}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Browsers */}
                          <div>
                            <h4 className="font-semibold mb-2">Browsers:</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(ipSummary.browsers).map(([browser, count]) => (
                                <span key={browser} className="bg-muted px-2 py-1 rounded text-sm">
                                  {browser}: {count}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Events */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
              {analyticsData.events.length === 0 ? (
                <p className="text-muted-foreground">No recent events found.</p>
              ) : (
                <div className="space-y-2">
                  {analyticsData.events.slice(0, 10).map((event, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold">{event.eventType}</span>
                          <span className="text-muted-foreground ml-2">on {event.pageUrl}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        IP: {event.ipAddress} | {event.deviceInfo.browser} on {event.deviceInfo.deviceType}
                        {event.timeOnPage && ` | ${Math.round(event.timeOnPage)}s on page`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        )}
      </div>
    </div>
  )
}