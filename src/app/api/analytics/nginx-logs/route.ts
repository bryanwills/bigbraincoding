import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import nginxLogParser from '@/lib/nginxLogParser';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateRange, logType = 'all' } = body;

    // Get log file paths from configuration
    const logFiles = config.logs.getLogFiles();
    const logFilePaths = [
      logFiles.access,
      logFiles.tracking,
      logFiles.ipTracking
    ];

    // Filter log files based on type
    let selectedLogFiles: string[] = [];
    switch (logType) {
      case 'access':
        selectedLogFiles = [logFilePaths[0]];
        break;
      case 'tracking':
        selectedLogFiles = [logFilePaths[1]];
        break;
      case 'ip_tracking':
        selectedLogFiles = [logFilePaths[2]];
        break;
      default:
        selectedLogFiles = logFilePaths.filter(file => existsSync(file));
    }

    if (selectedLogFiles.length === 0) {
      return NextResponse.json({
        entries: [],
        summary: {
          totalRequests: 0,
          uniqueIPs: [],
          statusCodes: {},
          topPaths: {},
          topUserAgents: {},
          topReferers: {},
          averageResponseTime: 0,
          totalBytesSent: 0,
          timeRange: { start: '', end: '' }
        }
      });
    }

    // Parse log files
    const entries = await nginxLogParser.parseLogFiles(selectedLogFiles);

    // Filter by date range if provided
    let filteredEntries = entries;
    if (dateRange && dateRange.start && dateRange.end) {
      filteredEntries = nginxLogParser.filterByDateRange(entries, dateRange.start, dateRange.end);
    }

    // Generate summary
    const summary = nginxLogParser.generateSummary(filteredEntries);

    // Get unique IPs with counts
    const uniqueIPs = nginxLogParser.getUniqueIPsWithCounts(filteredEntries);

    // Get filtered page analytics (excluding system paths)
    const filteredPages = nginxLogParser.getFilteredPageAnalytics(filteredEntries);

    // Separate bot and human traffic
    const { humanIPs, botIPs } = nginxLogParser.separateBotTraffic(filteredEntries);

    // Convert Set to Array for JSON serialization
    const serializableSummary = {
      ...summary,
      uniqueIPs: Array.from(summary.uniqueIPs),
      filteredPages,
      uniqueIPsWithCounts: uniqueIPs,
      humanIPs,
      botIPs
    };

    return NextResponse.json({
      entries: filteredEntries,
      summary: serializableSummary,
      logType,
      filesProcessed: selectedLogFiles
    });
  } catch (error) {
    console.error('NGINX Logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to parse NGINX logs' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logType = searchParams.get('type') || 'all';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const body: Record<string, unknown> = { logType };
    if (startDate && endDate) {
      body.dateRange = { start: startDate, end: endDate };
    }

    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(body)
    }));
  } catch (error) {
    console.error('NGINX Logs API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to parse NGINX logs' },
      { status: 500 }
    );
  }
}