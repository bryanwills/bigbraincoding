import { NextRequest, NextResponse } from 'next/server';
import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { FingerprintData } from '@/lib/fingerprintTracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fingerprintData: FingerprintData = body;

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Update the fingerprint data with the actual IP
    fingerprintData.ipAddress = ip;

    // Create log directory if it doesn't exist
    const logDir = join(process.env.HOME || '/home/bryanwi09', 'docker/nginx/logs');
    const fingerprintLogFile = join(logDir, 'fingerprint_tracking.log');

    // Ensure directory exists
    try {
      await mkdir(logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Format the data as a log entry similar to NGINX format
    const logEntry = formatFingerprintLogEntry(fingerprintData);

    // Append to fingerprint log file
    await appendFile(fingerprintLogFile, logEntry + '\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fingerprint tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track fingerprint data' },
      { status: 500 }
    );
  }
}

function formatFingerprintLogEntry(data: FingerprintData): string {
  const timestamp = new Date(data.timestamp).toISOString();
  const logData = {
    timestamp,
    visitorId: data.visitorId || 'unknown',
    ipAddress: data.ipAddress || 'unknown',
    userAgent: data.userAgent || 'unknown',
    browser: data.browser || 'unknown',
    deviceType: data.deviceType || 'unknown',
    screenResolution: data.screenResolution || 'unknown',
    timezone: data.timezone || 'unknown',
    language: data.language || 'unknown',
    platform: data.platform || 'unknown',
    cpuCores: data.cpuCores || 0,
    memorySize: data.memorySize || 0,
    canvas: data.canvas || '',
    webgl: data.webgl || '',
    audio: data.audio || '',
    fonts: (data.fonts || []).join(','),
    plugins: (data.plugins || []).join(','),
    sessionId: data.sessionId || 'unknown',
    pageUrl: data.pageUrl || 'unknown',
    referrer: data.referrer || 'unknown',
    timeOnPage: data.timeOnPage || 0,
    scrollDepth: data.scrollDepth || 0,
    clicks: data.interactions?.clicks || 0,
    scrolls: data.interactions?.scrolls || 0,
    formInteractions: data.interactions?.formInteractions || 0
  };

  // Format as JSON for easy parsing
  return JSON.stringify(logData);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    const ipAddress = searchParams.get('ip');

    if (!visitorId && !ipAddress) {
      return NextResponse.json(
        { error: 'visitorId or ip parameter is required' },
        { status: 400 }
      );
    }

    // Read fingerprint log file
    const logDir = join(process.env.HOME || '/home/bryanwi09', 'docker/nginx/logs');
    const fingerprintLogFile = join(logDir, 'fingerprint_tracking.log');

    if (!existsSync(fingerprintLogFile)) {
      return NextResponse.json({ entries: [] });
    }

    const { readFile } = await import('fs/promises');
    const content = await readFile(fingerprintLogFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const entries = lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(entry => entry !== null)
      .filter(entry => {
        if (visitorId && entry.visitorId !== visitorId) return false;
        if (ipAddress && entry.ipAddress !== ipAddress) return false;
        return true;
      });

    return NextResponse.json({
      entries,
      totalEntries: entries.length
    });
  } catch (error) {
    console.error('Error fetching fingerprint data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fingerprint data' },
      { status: 500 }
    );
  }
}