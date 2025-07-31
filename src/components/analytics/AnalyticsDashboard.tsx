'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [ipSummaries, setIpSummaries] = useState<IPSummary[]>([])
  const [selectedIP, setSelectedIP] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchIP, setSearchIP] = useState('')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API calls to your tracking data
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange: 'today' })
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        setIpSummaries(data.ipSummaries || [])
      } else {
        // For now, create some mock data
        setEvents([
          {
            timestamp: '2025-07-31T01:20:00.000Z',
            sessionId: 'test-session',
            eventType: 'pageview',
            pageUrl: 'https://bigbraincoding.com/test',
            ipAddress: '99.125.236.29',
            userAgent: 'Mozilla/5.0 (Test Browser)',
            deviceInfo: {
              browser: 'TestBrowser',
              deviceType: 'desktop',
              screenWidth: 1920,
              screenHeight: 1080,
              language: 'en-US'
            }
          }
        ])
        setIpSummaries([
          {
            ip: '99.125.236.29',
            totalVisits: 1,
            uniqueSessions: 1,
            pages: { '/test': 1 },
            devices: { 'desktop': 1 },
            browsers: { 'TestBrowser': 1 },
            averageTimeOnPage: 30,
            lastVisit: '2025-07-31T01:20:00.000Z',
            firstVisit: '2025-07-31T01:20:00.000Z'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      // Create mock data on error
      setEvents([
        {
          timestamp: '2025-07-31T01:20:00.000Z',
          sessionId: 'test-session',
          eventType: 'pageview',
          pageUrl: 'https://bigbraincoding.com/test',
          ipAddress: '99.125.236.29',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          deviceInfo: {
            browser: 'TestBrowser',
            deviceType: 'desktop',
            screenWidth: 1920,
            screenHeight: 1080,
            language: 'en-US'
          }
        }
      ])
      setIpSummaries([
        {
          ip: '99.125.236.29',
          totalVisits: 1,
          uniqueSessions: 1,
          pages: { '/test': 1 },
          devices: { 'desktop': 1 },
          browsers: { 'TestBrowser': 1 },
          averageTimeOnPage: 30,
          lastVisit: '2025-07-31T01:20:00.000Z',
          firstVisit: '2025-07-31T01:20:00.000Z'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIPDetails = (ip: string) => {
    return ipSummaries.find(summary => summary.ip === ip)
  }

  const filteredIPs = ipSummaries.filter(summary =>
    searchIP === '' || summary.ip.includes(searchIP)
  )

  const selectedIPDetails = selectedIP ? getIPDetails(selectedIP) : null
  const selectedIPEvents = events.filter(event => event.ipAddress === selectedIP)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading analytics data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by IP address..."
          value={searchIP}
          onChange={(e) => setSearchIP(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchAnalyticsData}>
          Refresh Data
        </Button>
      </div>

      {/* IP Addresses Summary */}
      <Card>
        <CardHeader>
          <CardTitle>IP Addresses ({filteredIPs.length})</CardTitle>
          <CardDescription>Click on an IP to see detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIPs.map((summary) => (
              <div
                key={summary.ip}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedIP === summary.ip ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedIP(summary.ip)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{summary.ip}</h3>
                    <p className="text-sm text-gray-600">
                      {summary.totalVisits} visits • {summary.uniqueSessions} sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {summary.devices.desktop || 0} desktop
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      Last: {new Date(summary.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected IP Details */}
      {selectedIPDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Details for {selectedIP}</CardTitle>
            <CardDescription>Detailed analytics for this IP address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{selectedIPDetails.totalVisits}</p>
                <p className="text-sm text-gray-600">Total Visits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{selectedIPDetails.uniqueSessions}</p>
                <p className="text-sm text-gray-600">Unique Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(selectedIPDetails.averageTimeOnPage)}s</p>
                <p className="text-sm text-gray-600">Avg Time on Page</p>
              </div>
            </div>

            {/* Pages Visited */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Pages Visited</h4>
              <div className="space-y-2">
                {Object.entries(selectedIPDetails.pages).map(([page, count]) => (
                  <div key={page} className="flex justify-between">
                    <span className="text-sm">{page}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <h4 className="font-semibold mb-2">Recent Events</h4>
              <div className="space-y-2">
                {selectedIPEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="flex justify-between">
                      <span>{event.eventType}</span>
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-gray-600">{event.pageUrl}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}