// NGINX Log Parser for Analytics Dashboard
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

class NGINXLogParser {
  /**
   * Convert UTC timestamp to Eastern Time
   */
  private convertToEasternTime(utcTimestamp: string): string {
    try {
      const utcDate = new Date(utcTimestamp);
      const etDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));

      // Format as ISO string but with ET timezone
      const year = etDate.getFullYear();
      const month = String(etDate.getMonth() + 1).padStart(2, '0');
      const day = String(etDate.getDate()).padStart(2, '0');
      const hours = String(etDate.getHours()).padStart(2, '0');
      const minutes = String(etDate.getMinutes()).padStart(2, '0');
      const seconds = String(etDate.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000-05:00`;
    } catch (error) {
      console.error('Error converting timestamp to ET:', error);
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
            timestamp: this.convertToEasternTime(this.parseTimestamp(timestamp)),
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
          timestamp: this.convertToEasternTime(this.parseTimestamp(timestamp)),
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
        timestamp: this.convertToEasternTime(this.parseTimestamp(timestamp)),
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
}

export const nginxLogParser = new NGINXLogParser();
export default nginxLogParser;