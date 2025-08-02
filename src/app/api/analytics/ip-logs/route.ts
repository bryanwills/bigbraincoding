import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import nginxLogParser from '@/lib/nginxLogParser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ipAddress, dateRange, logType = 'all' } = body;

    if (!ipAddress) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    // Define log file paths
    const logDir = join(process.env.HOME || '/home/bryanwi09', 'docker/nginx/logs');
    const logFiles = [
      join(logDir, 'bigbraincoding.com_access.log'),
      join(logDir, 'bigbraincoding.com_tracking.log'),
      join(logDir, 'bigbraincoding.com_ip_tracking.log')
    ];

    // Filter log files based on type
    let selectedLogFiles: string[] = [];
    switch (logType) {
      case 'access':
        selectedLogFiles = [logFiles[0]];
        break;
      case 'tracking':
        selectedLogFiles = [logFiles[1]];
        break;
      case 'ip_tracking':
        selectedLogFiles = [logFiles[2]];
        break;
      default:
        selectedLogFiles = logFiles.filter(file => existsSync(file));
    }

    if (selectedLogFiles.length === 0) {
      return NextResponse.json({
        entries: [],
        error: 'No log files found'
      });
    }

    // Parse log files
    const entries = await nginxLogParser.parseLogFiles(selectedLogFiles);

    // Filter by date range if provided
    let filteredEntries = entries;
    if (dateRange && dateRange.start && dateRange.end) {
      filteredEntries = nginxLogParser.filterByDateRange(entries, dateRange.start, dateRange.end);
    }

    // Get entries for the specific IP
    const ipEntries = nginxLogParser.getEntriesByIP(filteredEntries, ipAddress);

    if (ipEntries.length === 0) {
      return NextResponse.json({
        entries: [],
        error: 'IP address not found in logs'
      });
    }

    return NextResponse.json({
      entries: ipEntries,
      totalEntries: ipEntries.length,
      logType,
      filesProcessed: selectedLogFiles
    });
  } catch (error) {
    console.error('IP Logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to get IP logs' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get('ip');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!ipAddress) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    const body: Record<string, unknown> = { ipAddress };
    if (startDate && endDate) {
      body.dateRange = { start: startDate, end: endDate };
    }

    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(body)
    }));
  } catch (error) {
    console.error('IP Logs API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP logs' },
      { status: 500 }
    );
  }
}