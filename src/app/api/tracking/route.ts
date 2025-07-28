import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

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
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        deviceInfo: event.deviceInfo
      });

      return NextResponse.json({ success: true, logged: true, environment: 'vercel' });
    } else {
      // Local/Server deployment - use file system
      // Create timestamp for file naming
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');

      // Create directory structure: ~/bigbraincoding.com/YYYY/MM/DD/
      const baseDir = process.env.HOME || process.env.USERPROFILE || '/tmp';
      const logDir = join(baseDir, 'bigbraincoding.com', String(year), month, day);

      // Ensure directory exists
      if (!existsSync(logDir)) {
        await mkdir(logDir, { recursive: true });
      }

      // Create log file name with timestamp
      const fileName = `${hour}-${minute}-${second}-${event.sessionId.substring(0, 8)}.json`;
      const filePath = join(logDir, fileName);

      // Format the log entry
      const logEntry = {
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        eventType: event.eventType,
        pageUrl: event.pageUrl,
        referrer: event.referrer,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        deviceInfo: event.deviceInfo,
        eventData: event.eventData,
        timeOnPage: event.timeOnPage,
        timeOnPageSeconds: event.timeOnPage ? Math.round(event.timeOnPage / 1000) : undefined,
        scrollDepth: event.scrollDepth,
        performance: event.performance,
        engagement: event.engagement
      };

      // Write to file
      await writeFile(filePath, JSON.stringify(logEntry, null, 2));

      // Also write to a daily summary file
      const summaryFileName = `${year}-${month}-${day}-summary.json`;
      const summaryPath = join(logDir, summaryFileName);

      let summary: { events: Array<{ timestamp: string; eventType: string; sessionId: string; pageUrl: string; deviceType: string; browser: string }>; totalEvents: number; uniqueSessions: Set<string> } = { events: [], totalEvents: 0, uniqueSessions: new Set() };

      try {
        if (existsSync(summaryPath)) {
          const summaryData = await import('fs').then(fs => fs.readFileSync(summaryPath, 'utf8'));
          summary = JSON.parse(summaryData);
          summary.uniqueSessions = new Set(summary.uniqueSessions);
        }
      } catch {
        // If summary file doesn't exist or is corrupted, start fresh
        summary = { events: [], totalEvents: 0, uniqueSessions: new Set() };
      }

      // Add event to summary
      summary.events.push({
        timestamp: event.timestamp,
        eventType: event.eventType,
        sessionId: event.sessionId,
        pageUrl: event.pageUrl,
        deviceType: event.deviceInfo.deviceType,
        browser: event.deviceInfo.browser
      });

      summary.totalEvents++;
      summary.uniqueSessions.add(event.sessionId);

      // Convert Set back to array for JSON serialization
      const summaryForFile = {
        ...summary,
        uniqueSessions: Array.from(summary.uniqueSessions),
        lastUpdated: new Date().toISOString()
      };

      await writeFile(summaryPath, JSON.stringify(summaryForFile, null, 2));

      return NextResponse.json({ success: true, logged: true, environment: 'server' });
    }

  } catch (error) {
    console.error('Error logging tracking event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log tracking event' },
      { status: 500 }
    );
  }
}