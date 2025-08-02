import { IPAnalytics, UniqueIPSummary, NGINXLogEntry } from './nginxLogParser';

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  filename?: string;
}

/**
 * Export IP analytics to CSV
 */
export function exportIPAnalyticsToCSV(analytics: IPAnalytics): string {
  const lines: string[] = [];

  // Header
  lines.push('IP Analytics Report');
  lines.push('');

  // Basic info
  lines.push('IP Address,Value');
  lines.push(`IP Address,${analytics.ipAddress}`);
  lines.push(`Total Visits,${analytics.totalVisits}`);
  lines.push(`Sessions,${analytics.sessions}`);
  lines.push(`Average Time on Site (seconds),${analytics.averageTimeOnSite}`);
  lines.push(`Engagement Score,${analytics.engagementScore}%`);
  lines.push(`First Visit,${analytics.firstVisit}`);
  lines.push(`Last Visit,${analytics.lastVisit}`);
  lines.push('');

  // Pages visited
  lines.push('Pages Visited,Count');
  Object.entries(analytics.pages).forEach(([page, count]) => {
    lines.push(`${page},${count}`);
  });
  lines.push('');

  // Browsers
  lines.push('Browsers,Count');
  Object.entries(analytics.browsers).forEach(([browser, count]) => {
    lines.push(`${browser},${count}`);
  });
  lines.push('');

  // Devices
  lines.push('Devices,Count');
  Object.entries(analytics.devices).forEach(([device, count]) => {
    lines.push(`${device},${count}`);
  });
  lines.push('');

  // Sessions
  lines.push('Session Details');
  lines.push('Session ID,Start Time,End Time,Duration (seconds),Total Requests,Pages');
  analytics.sessionDetails.forEach((session) => {
    lines.push(`${session.sessionId},${session.startTime},${session.endTime},${session.duration},${session.totalRequests},"${session.pages.join('; ')}"`);
  });

  return lines.join('\n');
}

/**
 * Export IP analytics to XLSX format via CSV conversion
 */
export function exportIPAnalyticsToXLSX(analytics: IPAnalytics): void {
  // Validate input data
  if (!analytics || !analytics.ipAddress) {
    console.error('Invalid analytics data:', analytics);
    alert('Export failed: Invalid data to export');
    return;
  }

  console.log('Exporting IP analytics to XLSX via CSV:', { ipAddress: analytics.ipAddress, data: analytics });

  // Generate CSV content
  const csvContent = exportIPAnalyticsToCSV(analytics);

  console.log('CSV content generated:', csvContent);

  // Convert CSV to XLSX
  const filename = `ip-analytics-${analytics.ipAddress}-${new Date().toISOString().split('T')[0]}.xlsx`;
  csvToXLSX(csvContent, filename);
}

/**
 * Export all logs for an IP to CSV
 */
export function exportIPLogsToCSV(entries: NGINXLogEntry[], ipAddress: string): string {
  const lines: string[] = [];

  // Header
  lines.push('IP Logs Report');
  lines.push(`IP Address: ${ipAddress}`);
  lines.push('');

  // Column headers
  lines.push('Timestamp,Method,Path,Status Code,Bytes Sent,User Agent,Referer');

  // Data rows
  entries.forEach(entry => {
    lines.push(`"${entry.timestamp}","${entry.method}","${entry.path}",${entry.statusCode},${entry.bytesSent},"${entry.userAgent}","${entry.referer}"`);
  });

  return lines.join('\n');
}

/**
 * Export all logs for an IP to XLSX via CSV conversion
 */
export function exportIPLogsToXLSX(entries: NGINXLogEntry[], ipAddress: string): void {
  // Validate input data
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    console.error('Invalid or empty entries data:', entries);
    alert('Export failed: No data to export');
    return;
  }

  if (!ipAddress) {
    console.error('Invalid IP address:', ipAddress);
    alert('Export failed: Invalid IP address');
    return;
  }

  console.log('Exporting IP logs to XLSX via CSV:', { ipAddress, count: entries.length, data: entries });

  // Generate CSV content
  const csvContent = exportIPLogsToCSV(entries, ipAddress);

  console.log('CSV content generated:', csvContent);

  // Convert CSV to XLSX
  const filename = `ip-logs-${ipAddress}-${new Date().toISOString().split('T')[0]}.xlsx`;
  csvToXLSX(csvContent, filename);
}

/**
 * Export unique IPs list to CSV
 */
export function exportUniqueIPsToCSV(uniqueIPs: UniqueIPSummary[]): string {
  const lines: string[] = [];

  // Header
  lines.push('Unique IPs Report');
  lines.push('');

  // Column headers
  lines.push('IP Address,Total Visits,Sessions,Last Visit,Engagement Score');

  // Data rows
  uniqueIPs.forEach(ip => {
    lines.push(`"${ip.ipAddress}",${ip.totalVisits},${ip.sessions},"${ip.lastVisit}",${ip.engagementScore}%`);
  });

  return lines.join('\n');
}

/**
 * Convert CSV string to XLSX format
 */
export function csvToXLSX(csvContent: string, filename: string): void {
  console.log('Converting CSV to XLSX:', { filename, csvLength: csvContent.length });

  // Dynamically import SheetJS
  import('xlsx').then((XLSX) => {
    try {
      console.log('XLSX library loaded for CSV conversion');

      // Parse CSV content
      const workbook = XLSX.read(csvContent, { type: 'string' });

      console.log('CSV parsed successfully:', workbook);

      // Write to XLSX format
      const wbout = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'binary',
        bookSST: false,
        compression: true
      });

      console.log('XLSX write completed, output length:', wbout.length);

      // Convert to blob
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
      }

      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      console.log('Blob created, size:', blob.size);

      // Download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log('CSV to XLSX conversion completed successfully');
    } catch (error) {
      console.error('Error during CSV to XLSX conversion:', error);
      alert('Export failed: Error converting CSV to Excel file');
    }
  }).catch((error) => {
    console.error('Failed to load XLSX library for CSV conversion:', error);
    alert('XLSX export failed. Please install the xlsx library.');
  });
}

/**
 * Export unique IPs list to XLSX via CSV conversion
 */
export function exportUniqueIPsToXLSX(uniqueIPs: UniqueIPSummary[]): void {
  // Validate input data
  if (!uniqueIPs || !Array.isArray(uniqueIPs) || uniqueIPs.length === 0) {
    console.error('Invalid or empty uniqueIPs data:', uniqueIPs);
    alert('Export failed: No data to export');
    return;
  }

  console.log('Exporting unique IPs to XLSX via CSV:', { count: uniqueIPs.length, data: uniqueIPs });

  // Generate CSV content
  const csvContent = exportUniqueIPsToCSV(uniqueIPs);

  console.log('CSV content generated:', csvContent);

  // Convert CSV to XLSX
  const filename = `unique-ips-${new Date().toISOString().split('T')[0]}.xlsx`;
  csvToXLSX(csvContent, filename);
}

/**
 * Test XLSX export with simple data via CSV conversion
 */
export function testXLSXExport(): void {
  console.log('Testing XLSX export with simple data via CSV...');

  const testCSV = `Test Report

Name,Value
Test 1,100
Test 2,200
Test 3,300`;

  csvToXLSX(testCSV, 'test-export.xlsx');
}

/**
 * Download CSV data
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Download XLSX data using SheetJS
 */
export function downloadXLSX(workbook: Record<string, unknown>, filename: string): void {
  // Add debugging information
  console.log('Exporting XLSX:', { filename, workbook });

  // Validate workbook structure
  if (!workbook || !workbook.SheetNames || !workbook.Sheets) {
    console.error('Invalid workbook structure:', workbook);
    alert('Export failed: Invalid data structure');
    return;
  }

  // Check if sheets have data
  const hasData = Object.values(workbook.Sheets as Record<string, Record<string, unknown>>).some((sheet) => {
    const sheetKeys = Object.keys(sheet);
    console.log('Sheet keys:', sheetKeys);
    return sheetKeys.length > 0;
  });

  if (!hasData) {
    console.error('No data found in workbook');
    alert('Export failed: No data to export');
    return;
  }

  // Dynamically import SheetJS
  import('xlsx').then((XLSX) => {
    try {
      console.log('XLSX library loaded successfully');

      // Ensure proper workbook structure
      const processedWorkbook = {
        SheetNames: workbook.SheetNames as string[],
        Sheets: {} as Record<string, Record<string, { v: string | number; t: string }>>
      };

      // Process each sheet
      Object.entries(workbook.Sheets as Record<string, Record<string, unknown>>).forEach(([sheetName, sheetData]) => {
        console.log(`Processing sheet: ${sheetName}`, sheetData);
        const processedSheet: Record<string, { v: string | number; t: string }> = {};

        // Convert cell data to proper format
        Object.entries(sheetData).forEach(([cellRef, cellData]) => {
          if (cellData && typeof cellData === 'object' && 'v' in cellData) {
            const cellValue = (cellData as { v: string | number }).v;
            processedSheet[cellRef] = {
              v: cellValue,
              t: typeof cellValue === 'number' ? 'n' : 's'
            };
          }
        });

        processedWorkbook.Sheets[sheetName] = processedSheet;
        console.log(`Processed sheet ${sheetName}:`, processedSheet);
      });

      console.log('Processed workbook:', processedWorkbook);

      const wbout = XLSX.write(processedWorkbook, {
        bookType: 'xlsx',
        type: 'binary',
        bookSST: false,
        compression: true
      });

      console.log('XLSX write completed, output length:', wbout.length);

      // Convert to blob
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
      }

      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      console.log('Blob created, size:', blob.size);

      // Download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log('XLSX export completed successfully');
    } catch (error) {
      console.error('Error during XLSX generation:', error);
      alert('Export failed: Error generating Excel file');
    }
  }).catch((error) => {
    console.error('Failed to load XLSX library:', error);
    alert('XLSX export failed. Please install the xlsx library.');
  });
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    timeZone: 'America/Kentucky/Louisville',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}