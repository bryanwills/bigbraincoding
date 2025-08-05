'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface VisitorProfile {
  ip: string
  sessionId: string
  firstVisit: string
  lastVisit: string
  totalVisits: number
  totalTimeOnSite: number
  pagesVisited: string[]
  engagementScore: number
  leadScore: number
  deviceConsistency: boolean
  highEngagementPages: string[]
  conversionEvents: string[]
  timeBasedPatterns: {
    averageSessionDuration: number
    preferredVisitTimes: string[]
    returnVisitor: boolean
  }
}

interface LeadQualification {
  isQualified: boolean
  leadScore: number
  qualificationReason: string
  recommendedAction: string
  urgency: 'low' | 'medium' | 'high'
  nextBestAction: string
}

interface SalesIntelligence {
  highValueVisitors: VisitorProfile[]
  conversionOpportunities: {
    visitor: VisitorProfile
    opportunity: string
    confidence: number
  }[]
  marketInsights: {
    topPerformingPages: string[]
    commonUserJourneys: string[][]
    devicePreferences: Record<string, number>
    timeBasedTrends: Record<string, number>
  }
}

export default function MarketingIntelligenceDashboard() {
  const [visitorProfiles, setVisitorProfiles] = useState<VisitorProfile[]>([])
  const [salesIntelligence, setSalesIntelligence] = useState<SalesIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorProfile | null>(null)

  useEffect(() => {
    fetchMarketingIntelligence()
  }, [])

  const fetchMarketingIntelligence = async () => {
    try {
      setLoading(true)

      // This would be replaced with actual API calls
      const response = await fetch('/api/analytics/marketing-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange: 'today' })
      })

      if (response.ok) {
        const data = await response.json()
        setVisitorProfiles(data.visitorProfiles || [])
        setSalesIntelligence(data.salesIntelligence || null)
      } else {
        // Mock data for demonstration
        setVisitorProfiles([
          {
            ip: '192.168.1.100',
            sessionId: 'session-1',
            firstVisit: '2025-07-31T10:00:00.000Z',
            lastVisit: '2025-07-31T15:30:00.000Z',
            totalVisits: 3,
            totalTimeOnSite: 1800000, // 30 minutes
            pagesVisited: ['/', '/services', '/projects', '/contact'],
            engagementScore: 0.85,
            leadScore: 0.78,
            deviceConsistency: true,
            highEngagementPages: ['/services', '/projects', '/contact'],
            conversionEvents: ['contact_page_visited', 'services_page_visited'],
            timeBasedPatterns: {
              averageSessionDuration: 600000, // 10 minutes
              preferredVisitTimes: ['10:00', '14:00', '15:00'],
              returnVisitor: true
            }
          },
          {
            ip: '192.168.1.101',
            sessionId: 'session-2',
            firstVisit: '2025-07-31T12:00:00.000Z',
            lastVisit: '2025-07-31T12:15:00.000Z',
            totalVisits: 1,
            totalTimeOnSite: 900000, // 15 minutes
            pagesVisited: ['/', '/about'],
            engagementScore: 0.45,
            leadScore: 0.32,
            deviceConsistency: false,
            highEngagementPages: ['/about'],
            conversionEvents: [],
            timeBasedPatterns: {
              averageSessionDuration: 900000,
              preferredVisitTimes: ['12:00'],
              returnVisitor: false
            }
          }
        ])

        setSalesIntelligence({
          highValueVisitors: [
            {
              ip: '192.168.1.100',
              sessionId: 'session-1',
              firstVisit: '2025-07-31T10:00:00.000Z',
              lastVisit: '2025-07-31T15:30:00.000Z',
              totalVisits: 3,
              totalTimeOnSite: 1800000,
              pagesVisited: ['/', '/services', '/projects', '/contact'],
              engagementScore: 0.85,
              leadScore: 0.78,
              deviceConsistency: true,
              highEngagementPages: ['/services', '/projects', '/contact'],
              conversionEvents: ['contact_page_visited', 'services_page_visited'],
              timeBasedPatterns: {
                averageSessionDuration: 600000,
                preferredVisitTimes: ['10:00', '14:00', '15:00'],
                returnVisitor: true
              }
            }
          ],
          conversionOpportunities: [
            {
              visitor: {
                ip: '192.168.1.101',
                sessionId: 'session-2',
                firstVisit: '2025-07-31T12:00:00.000Z',
                lastVisit: '2025-07-31T12:15:00.000Z',
                totalVisits: 1,
                totalTimeOnSite: 900000,
                pagesVisited: ['/', '/about'],
                engagementScore: 0.45,
                leadScore: 0.32,
                deviceConsistency: false,
                highEngagementPages: ['/about'],
                conversionEvents: [],
                timeBasedPatterns: {
                  averageSessionDuration: 900000,
                  preferredVisitTimes: ['12:00'],
                  returnVisitor: false
                }
              },
              opportunity: 'Contact page conversion',
              confidence: 0.32
            }
          ],
          marketInsights: {
            topPerformingPages: ['/', '/services', '/projects', '/contact', '/about'],
            commonUserJourneys: [
              ['/', '/services'],
              ['/', '/projects'],
              ['/', '/contact']
            ],
            devicePreferences: { desktop: 70, mobile: 25, tablet: 5 },
            timeBasedTrends: { '10:00': 3, '12:00': 1, '14:00': 2, '15:00': 1 }
          }
        })
      }
    } catch (error) {
      console.error('Error fetching marketing intelligence:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading marketing intelligence...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Intelligence</h1>
          <p className="text-muted-foreground">
            Lead qualification and sales intelligence dashboard
          </p>
        </div>
        <Button onClick={fetchMarketingIntelligence}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Lead Qualification</TabsTrigger>
          <TabsTrigger value="sales">Sales Intelligence</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorProfiles.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active in last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visitorProfiles.filter(v => v.leadScore >= 0.6).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  High engagement visitors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(visitorProfiles.reduce((acc, v) => acc + v.engagementScore, 0) / visitorProfiles.length * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all visitors
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visitor Profiles</CardTitle>
              <CardDescription>
                Detailed visitor analysis and lead qualification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  console.log('MarketingIntelligenceDashboard visitorProfiles:', visitorProfiles); // Debug log

                  if (!visitorProfiles || !Array.isArray(visitorProfiles)) {
                    console.warn('MarketingIntelligenceDashboard visitorProfiles is not an array:', visitorProfiles);
                    return <div className="text-gray-600">No visitor profiles available</div>;
                  }

                                          return visitorProfiles.map((visitor) => (
                          <div
                            key={visitor.ip}
                            className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedVisitor(visitor)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <div>
                                  <div className="font-medium">{visitor.ip}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {visitor.totalVisits} visits • {formatDuration(visitor.totalTimeOnSite)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${getLeadScoreColor(visitor.leadScore)}`}>
                                  {Math.round(visitor.leadScore * 100)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Lead Score</div>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant={visitor.timeBasedPatterns.returnVisitor ? "default" : "secondary"}>
                                  {visitor.timeBasedPatterns.returnVisitor ? "Return Visitor" : "New Visitor"}
                                </Badge>
                                <Badge variant="outline">
                                  {visitor.highEngagementPages.length} key pages
                                </Badge>
                                <Badge variant="outline">
                                  {visitor.conversionEvents.length} conversions
                                </Badge>
                              </div>

                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Last visit: {new Date(visitor.lastVisit).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {salesIntelligence && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>High Value Visitors</CardTitle>
                    <CardDescription>
                      Visitors with lead score ≥ 60%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const highValueVisitors = salesIntelligence?.highValueVisitors;
                        console.log('MarketingIntelligenceDashboard highValueVisitors:', highValueVisitors); // Debug log

                        if (!highValueVisitors || !Array.isArray(highValueVisitors)) {
                          console.warn('MarketingIntelligenceDashboard highValueVisitors is not an array:', highValueVisitors);
                          return <div className="text-gray-600">No high value visitors available</div>;
                        }

                                                return highValueVisitors.map((visitor) => (
                          <div key={visitor.ip} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium">{visitor.ip}</div>
                              <div className="text-sm text-muted-foreground">
                                {visitor.conversionEvents.join(', ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {Math.round(visitor.leadScore * 100)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Opportunities</CardTitle>
                    <CardDescription>
                      Visitors ready for follow-up
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const conversionOpportunities = salesIntelligence?.conversionOpportunities;
                        console.log('MarketingIntelligenceDashboard conversionOpportunities:', conversionOpportunities); // Debug log

                        if (!conversionOpportunities || !Array.isArray(conversionOpportunities)) {
                          console.warn('MarketingIntelligenceDashboard conversionOpportunities is not an array:', conversionOpportunities);
                          return <div className="text-gray-600">No conversion opportunities available</div>;
                        }

                        return conversionOpportunities.map((opp) => (
                        <div key={opp.visitor.ip} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{opp.visitor.ip}</div>
                            <Badge variant="outline">
                              {Math.round(opp.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {opp.opportunity}
                          </div>
                        </div>
                      ));
                    })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {salesIntelligence && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Pages</CardTitle>
                    <CardDescription>
                      Most engaging content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {salesIntelligence.marketInsights.topPerformingPages.map((page, index) => (
                        <div key={page} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{page}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Common User Journeys</CardTitle>
                    <CardDescription>
                      Most frequent navigation paths
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {salesIntelligence.marketInsights.commonUserJourneys.map((journey, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="text-sm font-medium mb-1">
                            Journey {index + 1}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {journey.join(' → ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Visitor Details</h2>
              <Button variant="ghost" onClick={() => setSelectedVisitor(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                  <div className="font-medium">{selectedVisitor.ip}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Lead Score</div>
                  <div className={`font-bold ${getLeadScoreColor(selectedVisitor.leadScore)}`}>
                    {Math.round(selectedVisitor.leadScore * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Visits</div>
                  <div className="font-medium">{selectedVisitor.totalVisits}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Time</div>
                  <div className="font-medium">{formatDuration(selectedVisitor.totalTimeOnSite)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Pages Visited</div>
                <div className="flex flex-wrap gap-2">
                  {selectedVisitor.pagesVisited.map((page) => (
                    <Badge key={page} variant="outline">{page}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Conversion Events</div>
                <div className="flex flex-wrap gap-2">
                  {selectedVisitor.conversionEvents.map((event) => (
                    <Badge key={event} variant="default">{event}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Engagement Score</div>
                <Progress value={selectedVisitor.engagementScore * 100} className="w-full" />
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(selectedVisitor.engagementScore * 100)}% engagement
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}