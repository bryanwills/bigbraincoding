import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';

interface FingerprintEntry {
  timestamp: string;
  visitorId: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  deviceType: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cpuCores: number;
  memorySize: number;
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string; // Changed from string[] to string
  plugins: string; // Changed from string[] to string
  sessionId: string;
  pageUrl: string;
  referrer: string;
  timeOnPage: number;
  scrollDepth: number;
  clicks: number;
  scrolls: number;
  formInteractions: number;
}

interface FingerprintAnalytics {
  totalVisitors: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageTimeOnSite: number;
  averageScrollDepth: number;
  browsers: Record<string, number>;
  devices: Record<string, number>;
  timezones: Record<string, number>;
  languages: Record<string, number>;
  platforms: Record<string, number>;
  screenResolutions: Record<string, number>;
  topPages: Record<string, number>;
  topReferrers: Record<string, number>;
  interactionStats: {
    averageClicks: number;
    averageScrolls: number;
    averageFormInteractions: number;
  };
  recentVisitors: FingerprintEntry[];
}

export async function GET(request: NextRequest) {
  try {
    // Read fingerprint log file
    const logDir = join(process.env.HOME || '/home/bryanwi09', 'docker/nginx/logs');
    const fingerprintLogFile = join(logDir, 'fingerprint_tracking.log');

    if (!existsSync(fingerprintLogFile)) {
      return NextResponse.json({
        totalVisitors: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        averageTimeOnSite: 0,
        averageScrollDepth: 0,
        browsers: {},
        devices: {},
        timezones: {},
        languages: {},
        platforms: {},
        screenResolutions: {},
        topPages: {},
        topReferrers: {},
        interactionStats: {
          averageClicks: 0,
          averageScrolls: 0,
          averageFormInteractions: 0
        },
        recentVisitors: []
      });
    }

    const { readFile } = await import('fs/promises');
    const content = await readFile(fingerprintLogFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const entries: FingerprintEntry[] = lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error('Error parsing fingerprint log line:', error);
          return null;
        }
      })
      .filter(entry => entry !== null) as FingerprintEntry[];

    if (entries.length === 0) {
      return NextResponse.json({
        totalVisitors: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        averageTimeOnSite: 0,
        averageScrollDepth: 0,
        browsers: {},
        devices: {},
        timezones: {},
        languages: {},
        platforms: {},
        screenResolutions: {},
        topPages: {},
        topReferrers: {},
        interactionStats: {
          averageClicks: 0,
          averageScrolls: 0,
          averageFormInteractions: 0
        },
        recentVisitors: []
      });
    }

    // Calculate analytics
    const uniqueVisitors = new Set(entries.map(entry => entry.visitorId));
    const uniqueSessions = new Set(entries.map(entry => entry.sessionId));

    const browsers: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const timezones: Record<string, number> = {};
    const languages: Record<string, number> = {};
    const platforms: Record<string, number> = {};
    const screenResolutions: Record<string, number> = {};
    const topPages: Record<string, number> = {};
    const topReferrers: Record<string, number> = {};

    let totalTimeOnSite = 0;
    let totalScrollDepth = 0;
    let totalClicks = 0;
    let totalScrolls = 0;
    let totalFormInteractions = 0;

    entries.forEach(entry => {
      // Count browsers
      browsers[entry.browser] = (browsers[entry.browser] || 0) + 1;

      // Count devices
      devices[entry.deviceType] = (devices[entry.deviceType] || 0) + 1;

      // Count timezones
      timezones[entry.timezone] = (timezones[entry.timezone] || 0) + 1;

      // Count languages
      languages[entry.language] = (languages[entry.language] || 0) + 1;

      // Count platforms
      platforms[entry.platform] = (platforms[entry.platform] || 0) + 1;

      // Count screen resolutions
      screenResolutions[entry.screenResolution] = (screenResolutions[entry.screenResolution] || 0) + 1;

      // Count pages
      topPages[entry.pageUrl] = (topPages[entry.pageUrl] || 0) + 1;

      // Count referrers
      if (entry.referrer && entry.referrer !== 'unknown') {
        topReferrers[entry.referrer] = (topReferrers[entry.referrer] || 0) + 1;
      }

      // Sum interaction metrics
      totalTimeOnSite += entry.timeOnPage;
      totalScrollDepth += entry.scrollDepth;
      totalClicks += entry.clicks;
      totalScrolls += entry.scrolls;
      totalFormInteractions += entry.formInteractions;
    });

    const averageTimeOnSite = entries.length > 0 ? totalTimeOnSite / entries.length : 0;
    const averageScrollDepth = entries.length > 0 ? totalScrollDepth / entries.length : 0;
    const averageClicks = entries.length > 0 ? totalClicks / entries.length : 0;
    const averageScrolls = entries.length > 0 ? totalScrolls / entries.length : 0;
    const averageFormInteractions = entries.length > 0 ? totalFormInteractions / entries.length : 0;

    // Get recent visitors (last 50 entries)
    const recentVisitors = entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    const analytics: FingerprintAnalytics = {
      totalVisitors: uniqueVisitors.size, // Changed from entries.length to uniqueVisitors.size
      uniqueVisitors: uniqueVisitors.size,
      totalSessions: uniqueSessions.size,
      averageTimeOnSite,
      averageScrollDepth,
      browsers,
      devices,
      timezones,
      languages,
      platforms,
      screenResolutions,
      topPages,
      topReferrers,
      interactionStats: {
        averageClicks,
        averageScrolls,
        averageFormInteractions
      },
      recentVisitors
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error processing fingerprint analytics:', error);
    return NextResponse.json(
      { error: 'Failed to process fingerprint analytics' },
      { status: 500 }
    );
  }
}