import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
}

interface IPSummary {
  ip: string;
  totalVisits: number;
  uniqueSessions: number;
  pages: { [key: string]: number };
  devices: { [key: string]: number };
  browsers: { [key: string]: number };
  averageTimeOnPage: number;
  lastVisit: string;
  firstVisit: string;
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
        summary: [],
        events: [],
        totalVisitors: 0,
        totalSessions: 0,
        totalPageViews: 0
      });
    }

    const files = await readdir(logDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const events: TrackingEvent[] = [];
    const ipSummaries: { [key: string]: IPSummary } = {};
    const sessionSet = new Set<string>();

    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(logDir, file), 'utf-8');
        const event: TrackingEvent = JSON.parse(content);
        events.push(event);
        sessionSet.add(event.sessionId);

        // Initialize IP summary if not exists
        if (!ipSummaries[event.ipAddress]) {
          ipSummaries[event.ipAddress] = {
            ip: event.ipAddress,
            totalVisits: 0,
            uniqueSessions: 0,
            pages: {},
            devices: {},
            browsers: {},
            averageTimeOnPage: 0,
            lastVisit: event.timestamp,
            firstVisit: event.timestamp
          };
        }

        // Update IP summary
        const summary = ipSummaries[event.ipAddress];
        summary.totalVisits++;
        summary.lastVisit = event.timestamp;
        summary.firstVisit = event.timestamp < summary.firstVisit ? event.timestamp : summary.firstVisit;

        // Track pages
        const pageKey = event.pageUrl.split('?')[0]; // Remove query params
        summary.pages[pageKey] = (summary.pages[pageKey] || 0) + 1;

        // Track devices
        const deviceType = event.deviceInfo.deviceType || 'unknown';
        summary.devices[deviceType] = (summary.devices[deviceType] || 0) + 1;

        // Track browsers
        const browser = event.deviceInfo.browser || 'unknown';
        summary.browsers[browser] = (summary.browsers[browser] || 0) + 1;

        // Track time on page
        if (event.timeOnPage) {
          summary.averageTimeOnPage = (summary.averageTimeOnPage + event.timeOnPage) / 2;
        }

      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }

    // Calculate unique sessions per IP
    const ipSessions: { [key: string]: Set<string> } = {};
    events.forEach(event => {
      if (!ipSessions[event.ipAddress]) {
        ipSessions[event.ipAddress] = new Set();
      }
      ipSessions[event.ipAddress].add(event.sessionId);
    });

    // Update unique sessions count
    Object.keys(ipSummaries).forEach(ip => {
      ipSummaries[ip].uniqueSessions = ipSessions[ip]?.size || 0;
    });

    const summary = Object.values(ipSummaries).sort((a, b) => b.totalVisits - a.totalVisits);

    return NextResponse.json({
      summary,
      events: events.slice(-100), // Last 100 events
      totalVisitors: summary.length,
      totalSessions: sessionSet.size,
      totalPageViews: events.length
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({
      error: 'Failed to load analytics data',
      summary: [],
      events: [],
      totalVisitors: 0,
      totalSessions: 0,
      totalPageViews: 0
    }, { status: 500 });
  }
}