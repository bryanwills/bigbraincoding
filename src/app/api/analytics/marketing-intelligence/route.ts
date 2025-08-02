import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import marketingIntelligenceService from '@/lib/marketingIntelligence';

interface TrackingEvent {
  timestamp: string;
  sessionId: string;
  eventType: string;
  pageUrl: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: {
    browser: string;
    deviceType: string;
    screenWidth: number;
    screenHeight: number;
    language: string;
  };
  timeOnPage?: number;
  scrollDepth?: number;
  engagement?: {
    mouseMovements: number;
    clicks: number;
    scrollEvents: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let date = body.date;

    // If no date provided, use today's date
    if (!date) {
      const today = new Date();
      date = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }

    const [year, month, day] = date.split('-');
    const logDir = join(process.env.HOME || '/home/bryanwi09', 'docker/nginx/logs/bigbraincoding.com', year, month, day);

    if (!existsSync(logDir)) {
      return NextResponse.json({
        visitorProfiles: [],
        salesIntelligence: {
          highValueVisitors: [],
          conversionOpportunities: [],
          marketInsights: {
            topPerformingPages: [],
            commonUserJourneys: [],
            devicePreferences: {},
            timeBasedTrends: {}
          }
        }
      });
    }

    const files = await readdir(logDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !file.includes('summary'));

    const events: TrackingEvent[] = [];
    const sessionData: Map<string, {
      ip: string;
      sessionId: string;
      pages: string[];
      timeOnSite: number;
      engagementMetrics: Record<string, number>;
    }> = new Map();

    // Read and parse all tracking events
    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(logDir, file), 'utf-8');
        const event: TrackingEvent = JSON.parse(content);
        events.push(event);

        // Group events by session
        const sessionKey = event.sessionId;
        if (!sessionData.has(sessionKey)) {
          sessionData.set(sessionKey, {
            ip: event.ipAddress,
            sessionId: event.sessionId,
            pages: [],
            timeOnSite: 0,
            engagementMetrics: {
              mouseMovements: 0,
              clicks: 0,
              scrollEvents: 0
            }
          });
        }

        const session = sessionData.get(sessionKey)!;
        session.pages.push(event.pageUrl);
        session.timeOnSite += event.timeOnPage || 0;

        // Aggregate engagement metrics
        if (event.engagement) {
          session.engagementMetrics.mouseMovements += event.engagement.mouseMovements || 0;
          session.engagementMetrics.clicks += event.engagement.clicks || 0;
          session.engagementMetrics.scrollEvents += event.engagement.scrollEvents || 0;
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }

    // Update visitor profiles with session data
    for (const session of sessionData.values()) {
      marketingIntelligenceService.updateVisitorProfile(session);
    }

    // Get visitor profiles and sales intelligence
    const visitorProfiles = marketingIntelligenceService.getVisitorProfiles();
    const salesIntelligence = marketingIntelligenceService.generateSalesIntelligence();

    return NextResponse.json({
      visitorProfiles,
      salesIntelligence
    });
  } catch (error) {
    console.error('Marketing Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing intelligence' },
      { status: 500 }
    );
  }
}