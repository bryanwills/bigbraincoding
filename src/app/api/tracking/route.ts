import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    let ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Strip IPv6 prefix if present (::ffff:)
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    // Add IP address to event
    event.ipAddress = ip;

    // Check if we're on Vercel
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      // On Vercel, just log to console and return success
      // You can integrate with a database service here
      console.log('Vercel Tracking Event:', {
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        eventType: event.eventType,
        pageUrl: event.pageUrl,
        ipAddress: event.ipAddress, // Now includes IP
        userAgent: event.userAgent,
        deviceInfo: event.deviceInfo,
        timeOnPage: event.timeOnPage,
        scrollDepth: event.scrollDepth,
      });
      return NextResponse.json({ message: 'Event received (Vercel environment)' });
    }

    // For local/self-hosted environment, write to file
    const date = new Date(event.timestamp);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    // Corrected base directory for logs
    const baseLogDir = join(process.env.HOME || '/home/bryanwi09', 'docker/nginx/logs/bigbraincoding.com');
    const dailyLogDir = join(baseLogDir, year, month, day);

    if (!existsSync(dailyLogDir)) {
      await mkdir(dailyLogDir, { recursive: true });
    }

    const fileName = `${hour}-${minute}-${second}-${event.sessionId.substring(0, 8)}-${event.eventType}.json`;
    const filePath = join(dailyLogDir, fileName);

    await writeFile(filePath, JSON.stringify(event, null, 2));

    // Update daily summary
    const summaryFileName = `${year}-${month}-${day}-summary.json`;
    const summaryFilePath = join(dailyLogDir, summaryFileName);

    let dailySummary = {
      totalEvents: 0,
      uniqueVisitors: new Set<string>(),
      uniqueSessions: new Set<string>(),
      pageViews: 0,
      clicks: 0,
      ipAddresses: {} as { [key: string]: { totalVisits: number, uniqueSessions: Set<string> } }
    };

    if (existsSync(summaryFilePath)) {
      const existingSummary = await readFile(summaryFilePath, 'utf8');
      const parsedSummary = JSON.parse(existingSummary);
      dailySummary.totalEvents = parsedSummary.totalEvents || 0;
      dailySummary.pageViews = parsedSummary.pageViews || 0;
      dailySummary.clicks = parsedSummary.clicks || 0;
      dailySummary.uniqueVisitors = new Set(parsedSummary.uniqueVisitors || []);
      dailySummary.uniqueSessions = new Set(parsedSummary.uniqueSessions || []);
      for (const ip in parsedSummary.ipAddresses) {
        dailySummary.ipAddresses[ip] = {
          totalVisits: parsedSummary.ipAddresses[ip].totalVisits || 0,
          uniqueSessions: new Set(parsedSummary.ipAddresses[ip].uniqueSessions || [])
        };
      }
    }

    dailySummary.totalEvents++;
    dailySummary.uniqueVisitors.add(event.ipAddress);
    dailySummary.uniqueSessions.add(event.sessionId);

    if (event.eventType === 'page_view') {
      dailySummary.pageViews++;
    } else if (event.eventType === 'click') {
      dailySummary.clicks++;
    }

    if (!dailySummary.ipAddresses[event.ipAddress]) {
      dailySummary.ipAddresses[event.ipAddress] = { totalVisits: 0, uniqueSessions: new Set<string>() };
    }
    dailySummary.ipAddresses[event.ipAddress].totalVisits++;
    dailySummary.ipAddresses[event.ipAddress].uniqueSessions.add(event.sessionId);

    const serializableSummary = {
      ...dailySummary,
      uniqueVisitors: Array.from(dailySummary.uniqueVisitors),
      uniqueSessions: Array.from(dailySummary.uniqueSessions),
      ipAddresses: Object.fromEntries(
        Object.entries(dailySummary.ipAddresses).map(([ip, data]) => [
          ip,
          { totalVisits: data.totalVisits, uniqueSessions: Array.from(data.uniqueSessions) }
        ])
      )
    };

    await writeFile(summaryFilePath, JSON.stringify(serializableSummary, null, 2));

    return NextResponse.json({ message: 'Event received and logged' });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Failed to log event' },
      { status: 500 }
    );
  }
}