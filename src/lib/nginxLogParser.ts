// NGINX Log Parser for Analytics Dashboard
import { config } from './config';

export interface NGINXLogEntry {
  timestamp: string;
  ipAddress: string;
  method: string;
  path: string;
  statusCode: number;
  bytesSent: number;
  referer: string;
  userAgent: string;
  requestTime: number;
  upstreamResponseTime: number;
  acceptLanguage: string;
  acceptEncoding: string;
  connection: string;
  upgrade: string;
  secFetchDest: string;
  secFetchMode: string;
  secFetchSite: string;
  secFetchUser: string;
}

export interface NGINXLogSummary {
  totalRequests: number;
  uniqueIPs: Set<string>;
  statusCodes: Record<number, number>;
  topPaths: Record<string, number>;
  topUserAgents: Record<string, number>;
  topReferers: Record<string, number>;
  averageResponseTime: number;
  totalBytesSent: number;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface IPAnalytics {
  ipAddress: string;
  totalVisits: number;
  sessions: number;
  averageTimeOnSite: number;
  pages: Record<string, number>;
  browsers: Record<string, number>;
  devices: Record<string, number>;
  engagementScore: number;
  firstVisit: string;
  lastVisit: string;
  sessionDetails: SessionDetail[];
}

export interface SessionDetail {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;
  pages: string[];
  totalRequests: number;
}

export interface UniqueIPSummary {
  ipAddress: string;
  totalVisits: number;
  sessions: number;
  lastVisit: string;
  engagementScore: number;
}

class NGINXLogParser {
  /**
   * Convert UTC timestamp to configured timezone
   */
  private convertToConfiguredTimezone(utcTimestamp: string): string {
    try {
      const utcDate = new Date(utcTimestamp);
      const configuredDate = new Date(utcDate.toLocaleString('en-US', { timeZone: config.analytics.timezone }));

      // Format as ISO string but with configured timezone
      const year = configuredDate.getFullYear();
      const month = String(configuredDate.getMonth() + 1).padStart(2, '0');
      const day = String(configuredDate.getDate()).padStart(2, '0');
      const hours = String(configuredDate.getHours()).padStart(2, '0');
      const minutes = String(configuredDate.getMinutes()).padStart(2, '0');
      const seconds = String(configuredDate.getSeconds()).padStart(2, '0');

      // Get timezone offset for configured timezone
      const timezoneOffset = configuredDate.getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
      const offsetMinutes = Math.abs(timezoneOffset % 60);
      const offsetSign = timezoneOffset > 0 ? '-' : '+';

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error converting timestamp to configured timezone:', error);
      return utcTimestamp; // Fallback to original timestamp
    }
  }

  /**
   * Parse a single NGINX log line
   */
  private parseLogLine(line: string): NGINXLogEntry | null {
    try {
      // Parse the main log format: combined + tracking format
      const regex = /^(\S+) - - \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" rt=([^ ]+) uct="([^"]*)" uht="([^"]*)" urt="([^"]*)" ua="([^"]*)" us="([^"]*)"$/;
      const match = line.match(regex);

      if (!match) {
        // Try tracking log format
        const trackingRegex = /^(\S+) - - \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)" "([^"]*)" ([^ ]+) - ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)$/;
        const trackingMatch = line.match(trackingRegex);

        if (trackingMatch) {
          const [
            ,
            ipAddress,
            timestamp,
            request,
            statusCode,
            bytesSent,
            referer,
            userAgent,
            xForwardedFor,
            requestTime,
            acceptLanguage,
            acceptEncoding,
            connection,
            upgrade,
            secFetchDest,
            secFetchMode,
            secFetchSite,
            secFetchUser
          ] = trackingMatch;

          // Parse the request line
          const requestMatch = request.match(/^(\S+) (\S+) (\S+)$/);
          if (!requestMatch) {
            return null;
          }

          const [, method, path, httpVersion] = requestMatch;

          // Extract real IP from X-Forwarded-For header
          let realIP = ipAddress;
          if (xForwardedFor && xForwardedFor !== '-') {
            // X-Forwarded-For can contain multiple IPs, take the first one
            const forwardedIPs = xForwardedFor.split(',');
            if (forwardedIPs.length > 0) {
              realIP = forwardedIPs[0].trim();
            }
          }

          return {
            timestamp: this.convertToConfiguredTimezone(this.parseTimestamp(timestamp)),
            ipAddress: realIP,
            method,
            path,
            statusCode: parseInt(statusCode),
            bytesSent: parseInt(bytesSent),
            referer: referer === '-' ? '' : referer,
            userAgent: userAgent === '-' ? '' : userAgent,
            requestTime: parseFloat(requestTime) || 0,
            upstreamResponseTime: 0,
            acceptLanguage: acceptLanguage === '-' ? '' : acceptLanguage,
            acceptEncoding: acceptEncoding === '-' ? '' : acceptEncoding,
            connection: connection === '-' ? '' : connection,
            upgrade: upgrade === '-' ? '' : upgrade,
            secFetchDest: secFetchDest === '-' ? '' : secFetchDest,
            secFetchMode: secFetchMode === '-' ? '' : secFetchMode,
            secFetchSite: secFetchSite === '-' ? '' : secFetchSite,
            secFetchUser: secFetchUser === '-' ? '' : secFetchUser
          };
        }

        // Try alternative format for logs without tracking data
        const altRegex = /^(\S+) - - \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"$/;
        const altMatch = line.match(altRegex);

        if (!altMatch) {
          return null;
        }

        const [
          ,
          ipAddress,
          timestamp,
          request,
          statusCode,
          bytesSent,
          referer,
          userAgent
        ] = altMatch;

        // Parse the request line
        const requestMatch = request.match(/^(\S+) (\S+) (\S+)$/);
        if (!requestMatch) {
          return null;
        }

        const [, method, path, httpVersion] = requestMatch;

        return {
          timestamp: this.convertToConfiguredTimezone(this.parseTimestamp(timestamp)),
          ipAddress,
          method,
          path,
          statusCode: parseInt(statusCode),
          bytesSent: parseInt(bytesSent),
          referer: referer === '-' ? '' : referer,
          userAgent: userAgent === '-' ? '' : userAgent,
          requestTime: 0,
          upstreamResponseTime: 0,
          acceptLanguage: '',
          acceptEncoding: '',
          connection: '',
          upgrade: '',
          secFetchDest: '',
          secFetchMode: '',
          secFetchSite: '',
          secFetchUser: ''
        };
      }

      const [
        ,
        ipAddress,
        timestamp,
        request,
        statusCode,
        bytesSent,
        referer,
        userAgent,
        xForwardedFor,
        xRealIP,
        requestTime,
        upstreamConnectTime,
        upstreamHeaderTime,
        upstreamResponseTime,
        userAgent2,
        userSession
      ] = match;

      // Parse the request line
      const requestMatch = request.match(/^(\S+) (\S+) (\S+)$/);
      if (!requestMatch) {
        return null;
      }

      const [, method, path, httpVersion] = requestMatch;

      // Extract real IP from X-Forwarded-For header
      let realIP = ipAddress || 'unknown';
      if (xForwardedFor && xForwardedFor !== '-') {
        // X-Forwarded-For can contain multiple IPs, take the first one
        const forwardedIPs = xForwardedFor.split(',');
        if (forwardedIPs.length > 0) {
          realIP = forwardedIPs[0].trim();
        }
      }

      return {
        timestamp: this.convertToConfiguredTimezone(this.parseTimestamp(timestamp)),
        ipAddress: realIP,
        method,
        path,
        statusCode: parseInt(statusCode),
        bytesSent: parseInt(bytesSent),
        referer: referer === '-' ? '' : referer,
        userAgent: userAgent === '-' ? '' : userAgent,
        requestTime: parseFloat(requestTime) || 0,
        upstreamResponseTime: parseFloat(upstreamResponseTime) || 0,
        acceptLanguage: '',
        acceptEncoding: '',
        connection: '',
        upgrade: '',
        secFetchDest: '',
        secFetchMode: '',
        secFetchSite: '',
        secFetchUser: ''
      };
    } catch (error) {
      console.error('Error parsing NGINX log line:', error);
      return null;
    }
  }

  /**
   * Parse timestamp from NGINX log format
   */
  private parseTimestamp(timestamp: string): string {
    // Convert from NGINX format to ISO string
    // Format: 25/Jul/2025:15:10:42 +0000
    const match = timestamp.match(/^(\d+)\/(\w+)\/(\d+):(\d+):(\d+):(\d+) ([\+\-]\d{4})$/);

    if (!match) {
      return new Date().toISOString();
    }

    const [, day, month, year, hour, minute, second, timezone] = match;

    // Convert month name to number
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const monthNum = monthMap[month] || '01';
    const paddedDay = day.padStart(2, '0');
    const paddedHour = hour.padStart(2, '0');
    const paddedMinute = minute.padStart(2, '0');
    const paddedSecond = second.padStart(2, '0');

    // Create ISO string (assuming UTC for now, we'll convert to ET later)
    const utcTimestamp = `${year}-${monthNum}-${paddedDay}T${paddedHour}:${paddedMinute}:${paddedSecond}.000Z`;

    return utcTimestamp;
  }

  /**
   * Read and parse NGINX log files
   */
  public async parseLogFiles(logPaths: string[]): Promise<NGINXLogEntry[]> {
    const entries: NGINXLogEntry[] = [];

    for (const logPath of logPaths) {
      try {
        const fs = await import('fs/promises');
        const content = await fs.readFile(logPath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          const entry = this.parseLogLine(line);
          if (entry) {
            entries.push(entry);
          }
        }
      } catch (error) {
        console.error(`Error reading log file ${logPath}:`, error);
      }
    }

    return entries;
  }

  /**
   * Generate summary statistics from log entries
   */
  public generateSummary(entries: NGINXLogEntry[]): NGINXLogSummary {
    const summary: NGINXLogSummary = {
      totalRequests: entries.length,
      uniqueIPs: new Set(),
      statusCodes: {},
      topPaths: {},
      topUserAgents: {},
      topReferers: {},
      averageResponseTime: 0,
      totalBytesSent: 0,
      timeRange: {
        start: '',
        end: ''
      }
    };

    let totalResponseTime = 0;
    let validResponseTimes = 0;

    for (const entry of entries) {
      // Count unique IPs
      summary.uniqueIPs.add(entry.ipAddress);

      // Count status codes
      summary.statusCodes[entry.statusCode] = (summary.statusCodes[entry.statusCode] || 0) + 1;

      // Count paths
      summary.topPaths[entry.path] = (summary.topPaths[entry.path] || 0) + 1;

      // Count user agents
      if (entry.userAgent) {
        const browser = this.extractBrowser(entry.userAgent);
        summary.topUserAgents[browser] = (summary.topUserAgents[browser] || 0) + 1;
      }

      // Count referers
      if (entry.referer) {
        const domain = this.extractDomain(entry.referer);
        summary.topReferers[domain] = (summary.topReferers[domain] || 0) + 1;
      }

      // Calculate response times
      if (entry.requestTime > 0) {
        totalResponseTime += entry.requestTime;
        validResponseTimes++;
      }

      // Sum bytes sent
      summary.totalBytesSent += entry.bytesSent;

      // Track time range
      if (!summary.timeRange.start || entry.timestamp < summary.timeRange.start) {
        summary.timeRange.start = entry.timestamp;
      }
      if (!summary.timeRange.end || entry.timestamp > summary.timeRange.end) {
        summary.timeRange.end = entry.timestamp;
      }
    }

    // Calculate average response time
    if (validResponseTimes > 0) {
      summary.averageResponseTime = totalResponseTime / validResponseTimes;
    }

    return summary;
  }

  /**
   * Extract browser name from user agent
   */
  private extractBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    if (ua.includes('bot') || ua.includes('crawler')) return 'Bot';

    return 'Other';
  }

  /**
   * Extract domain from referer URL
   */
  private extractDomain(referer: string): string {
    try {
      const url = new URL(referer);
      return url.hostname;
    } catch {
      return 'Direct';
    }
  }

  /**
   * Get top N items from a record
   */
  public getTopItems(record: Record<string, number>, limit: number = 10): Array<{ key: string; count: number }> {
    return Object.entries(record)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  }

  /**
   * Filter entries by date range
   */
  public filterByDateRange(entries: NGINXLogEntry[], startDate: string, endDate: string): NGINXLogEntry[] {
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const isInRange = entryDate >= start && entryDate <= end;

      return isInRange;
    });

    return filtered;
  }

  /**
   * Get entries for a specific IP address
   */
  public getEntriesByIP(entries: NGINXLogEntry[], ipAddress: string): NGINXLogEntry[] {
    return entries.filter(entry => entry.ipAddress === ipAddress);
  }

  /**
   * Get entries for a specific path
   */
  public getEntriesByPath(entries: NGINXLogEntry[], path: string): NGINXLogEntry[] {
    return entries.filter(entry => entry.path === path);
  }

  /**
   * Get all unique IPs with their visit counts and basic analytics
   */
  public getUniqueIPsWithCounts(entries: NGINXLogEntry[]): UniqueIPSummary[] {
    const ipMap = new Map<string, UniqueIPSummary>();

    for (const entry of entries) {
      // Skip Docker container IPs
      if (this.isDockerIP(entry.ipAddress)) {
        continue;
      }

      if (!ipMap.has(entry.ipAddress)) {
        ipMap.set(entry.ipAddress, {
          ipAddress: entry.ipAddress,
          totalVisits: 0,
          sessions: 0,
          lastVisit: entry.timestamp,
          engagementScore: 0
        });
      }

      const summary = ipMap.get(entry.ipAddress)!;
      summary.totalVisits++;
      summary.lastVisit = entry.timestamp > summary.lastVisit ? entry.timestamp : summary.lastVisit;
    }

    // Calculate sessions and engagement scores
    for (const [ip, summary] of ipMap) {
      const ipEntries = this.getEntriesByIP(entries, ip);
      summary.sessions = this.calculateSessions(ipEntries);
      summary.engagementScore = this.calculateEngagementScore(ipEntries);
    }

    return Array.from(ipMap.values()).sort((a, b) => b.totalVisits - a.totalVisits);
  }

  /**
   * Check if an IP is a Docker container IP
   */
  private isDockerIP(ipAddress: string): boolean {
    // Common Docker IP ranges
    const dockerRanges = [
      '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.',
      '10.0.', '10.1.', '10.2.', '10.3.', '10.4.', '10.5.', '10.6.', '10.7.', '10.8.', '10.9.',
      '192.168.',
      '127.0.0.1',
      'localhost'
    ];

    return dockerRanges.some(range => ipAddress.startsWith(range));
  }

  /**
   * Detect if an IP is likely a bot
   */
  public isBotIP(entries: NGINXLogEntry[]): boolean {
    if (entries.length === 0) return false;

    const ipAddress = entries[0].ipAddress;
    const uniqueUserAgents = new Set(entries.map(e => e.userAgent));
    const uniqueDevices = new Set(entries.map(e => this.extractDeviceType(e.userAgent)));
    const uniqueBrowsers = new Set(entries.map(e => this.extractBrowser(e.userAgent)));

    // Bot indicators
    const indicators = {
      multipleUserAgents: uniqueUserAgents.size > 5,
      multipleDevices: uniqueDevices.size > 3,
      multipleBrowsers: uniqueBrowsers.size > 3,
      highRequestRate: entries.length > 100,
      hasBotInUserAgent: entries.some(e => e.userAgent.toLowerCase().includes('bot')),
      hasCrawlerInUserAgent: entries.some(e => e.userAgent.toLowerCase().includes('crawler')),
      hasSpiderInUserAgent: entries.some(e => e.userAgent.toLowerCase().includes('spider'))
    };

    // Count positive indicators
    const positiveIndicators = Object.values(indicators).filter(Boolean).length;

    // If 3 or more indicators are positive, consider it a bot
    return positiveIndicators >= 3;
  }

  /**
   * Get bot vs human traffic separation
   */
  public separateBotTraffic(entries: NGINXLogEntry[]): {
    humanIPs: UniqueIPSummary[];
    botIPs: UniqueIPSummary[];
  } {
    const uniqueIPs = this.getUniqueIPsWithCounts(entries);
    const humanIPs: UniqueIPSummary[] = [];
    const botIPs: UniqueIPSummary[] = [];

    for (const ipSummary of uniqueIPs) {
      const ipEntries = this.getEntriesByIP(entries, ipSummary.ipAddress);

      if (this.isBotIP(ipEntries)) {
        botIPs.push(ipSummary);
      } else {
        humanIPs.push(ipSummary);
      }
    }

    return { humanIPs, botIPs };
  }

  /**
   * Get detailed analytics for a specific IP address
   */
  public getIPAnalytics(entries: NGINXLogEntry[], ipAddress: string): IPAnalytics | null {
    const ipEntries = this.getEntriesByIP(entries, ipAddress);
    if (ipEntries.length === 0) return null;

    const sessions = this.getSessionsForIP(ipEntries);
    const pages = this.getPageVisits(ipEntries);
    const browsers = this.getBrowserUsage(ipEntries);
    const devices = this.getDeviceUsage(ipEntries);

    const firstVisit = ipEntries.reduce((earliest, entry) =>
      entry.timestamp < earliest ? entry.timestamp : earliest, ipEntries[0].timestamp);
    const lastVisit = ipEntries.reduce((latest, entry) =>
      entry.timestamp > latest ? entry.timestamp : latest, ipEntries[0].timestamp);

    const averageTimeOnSite = this.calculateAverageTimeOnSite(sessions);
    const engagementScore = this.calculateEngagementScore(ipEntries);

    return {
      ipAddress,
      totalVisits: sessions.length, // Changed from ipEntries.length to sessions.length
      sessions: sessions.length,
      averageTimeOnSite,
      pages,
      browsers,
      devices,
      engagementScore,
      firstVisit,
      lastVisit,
      sessionDetails: sessions
    };
  }

  /**
   * Calculate sessions for an IP address (with proper session breaks)
   */
  private calculateSessions(entries: NGINXLogEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let sessions = 1;
    let lastActivity = new Date(sortedEntries[0].timestamp);

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentActivity = new Date(sortedEntries[i].timestamp);
      const timeDiff = currentActivity.getTime() - lastActivity.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // If more than configured session timeout minutes have passed, it's a new session
      if (minutesDiff > config.analytics.sessionTimeout) {
        sessions++;
      }
      lastActivity = currentActivity;
    }

    return sessions;
  }

  /**
   * Get detailed sessions for an IP address
   */
  public getSessionsForIP(entries: NGINXLogEntry[]): SessionDetail[] {
    if (entries.length === 0) return [];

    const sortedEntries = entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const sessions: SessionDetail[] = [];
    let currentSession: SessionDetail | null = null;
    let lastActivity = new Date(sortedEntries[0].timestamp);

    for (const entry of sortedEntries) {
      const currentActivity = new Date(entry.timestamp);
      const timeDiff = currentActivity.getTime() - lastActivity.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Start new session if more than configured session timeout minutes have passed
      if (!currentSession || minutesDiff > config.analytics.sessionTimeout) {
        if (currentSession) {
          // Finalize previous session
          currentSession.endTime = lastActivity.toISOString();
          currentSession.duration = (new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000;
          sessions.push(currentSession);
        }

        // Start new session
        currentSession = {
          sessionId: `${entry.ipAddress}-${currentActivity.getTime()}`,
          startTime: entry.timestamp,
          endTime: '',
          duration: 0,
          pages: [],
          totalRequests: 0
        };
      }

      // Add to current session (only if it's not a system path)
      if (currentSession && this.isActualPage(entry.path)) {
        currentSession.totalRequests++;
        if (!currentSession.pages.includes(entry.path)) {
          currentSession.pages.push(entry.path);
        }
      }

      lastActivity = currentActivity;
    }

    // Finalize last session
    if (currentSession) {
      currentSession.endTime = lastActivity.toISOString();
      currentSession.duration = (new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000;
      sessions.push(currentSession);
    }

    return sessions;
  }

  /**
   * Get page visits for an IP (filtered to actual pages)
   */
  private getPageVisits(entries: NGINXLogEntry[]): Record<string, number> {
    const pages: Record<string, number> = {};

    for (const entry of entries) {
      // Filter out system paths and focus on actual pages
      if (this.isActualPage(entry.path)) {
        const cleanPath = this.cleanPagePath(entry.path);
        pages[cleanPath] = (pages[cleanPath] || 0) + 1;
      }
    }

    return pages;
  }

  /**
   * Check if a path is an actual page (not system files)
   */
  private isActualPage(path: string): boolean {
    const systemPaths = [
      '/_next/',
      '/api/',
      '/static/',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml'
    ];

    return !systemPaths.some(systemPath => path.startsWith(systemPath));
  }

  /**
   * Clean page path for better analytics
   */
  private cleanPagePath(path: string): string {
    // Remove query parameters
    const cleanPath = path.split('?')[0];

    // Map common paths to readable names
    const pathMap: Record<string, string> = {
      '/': 'Homepage',
      '/projects': 'Projects',
      '/about': 'About',
      '/contact': 'Contact',
      '/services': 'Services'
    };

    return pathMap[cleanPath] || cleanPath;
  }

  /**
   * Get browser usage for an IP
   */
  private getBrowserUsage(entries: NGINXLogEntry[]): Record<string, number> {
    const browsers: Record<string, number> = {};

    for (const entry of entries) {
      const browser = this.extractBrowser(entry.userAgent);
      browsers[browser] = (browsers[browser] || 0) + 1;
    }

    return browsers;
  }

  /**
   * Get device usage for an IP
   */
  private getDeviceUsage(entries: NGINXLogEntry[]): Record<string, number> {
    const devices: Record<string, number> = {};

    for (const entry of entries) {
      const deviceType = this.extractDeviceType(entry.userAgent);
      devices[deviceType] = (devices[deviceType] || 0) + 1;
    }

    return devices;
  }

  /**
   * Extract device type from user agent
   */
  private extractDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    } else if (ua.includes('bot') || ua.includes('crawler')) {
      return 'Bot';
    } else {
      return 'Desktop';
    }
  }

  /**
   * Calculate average time on site from sessions
   */
  private calculateAverageTimeOnSite(sessions: SessionDetail[]): number {
    if (sessions.length === 0) return 0;

    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    return totalTime / sessions.length;
  }

  /**
   * Calculate engagement score based on various factors
   */
  private calculateEngagementScore(entries: NGINXLogEntry[]): number {
    if (entries.length === 0) return 0;

    let score = 0;

    // Base score from number of visits
    score += Math.min(entries.length * 10, 100);

    // Bonus for multiple pages visited
    const uniquePages = new Set(entries.map(e => e.path).filter(p => this.isActualPage(p)));
    score += uniquePages.size * 15;

    // Bonus for longer time on site (if we have session data)
    const sessions = this.getSessionsForIP(entries);
    if (sessions.length > 0) {
      const avgSessionTime = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
      score += Math.min(avgSessionTime / 60 * 20, 50); // Up to 50 points for time
    }

    // Bonus for multiple sessions
    score += Math.min(sessions.length * 10, 30);

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get filtered page analytics (excluding system paths)
   */
  public getFilteredPageAnalytics(entries: NGINXLogEntry[]): Record<string, number> {
    const pages: Record<string, number> = {};

    for (const entry of entries) {
      if (this.isActualPage(entry.path)) {
        const cleanPath = this.cleanPagePath(entry.path);
        pages[cleanPath] = (pages[cleanPath] || 0) + 1;
      }
    }

    return pages;
  }
}

export const nginxLogParser = new NGINXLogParser();
export default nginxLogParser;