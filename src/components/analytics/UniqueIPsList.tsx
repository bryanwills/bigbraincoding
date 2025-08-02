'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportUniqueIPsToCSV, exportUniqueIPsToXLSX, downloadCSV, testXLSXExport } from '@/lib/exportUtils';
import { UniqueIPSummary } from '@/lib/nginxLogParser';

interface UniqueIPsListProps {
  uniqueIPs: UniqueIPSummary[];
  humanIPs?: UniqueIPSummary[];
  botIPs?: UniqueIPSummary[];
  dateRange: { start: string; end: string };
}

type SortField = 'visits' | 'sessions' | 'engagement' | 'lastVisit';
type SortOrder = 'asc' | 'desc';

export default function UniqueIPsList({ uniqueIPs, humanIPs, botIPs }: UniqueIPsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('visits');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<'all' | 'human' | 'bot'>('all');
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const displayIPs = useMemo(() => {
    let ips = uniqueIPs;

    if (activeTab === 'human' && humanIPs) {
      ips = humanIPs;
    } else if (activeTab === 'bot' && botIPs) {
      ips = botIPs;
    }

    // Apply search filter
    if (searchTerm) {
      ips = ips.filter(ip =>
        ip.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    ips.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'visits':
          aValue = a.totalVisits;
          bValue = b.totalVisits;
          break;
        case 'sessions':
          aValue = a.sessions;
          bValue = b.sessions;
          break;
        case 'engagement':
          aValue = a.engagementScore;
          bValue = b.engagementScore;
          break;
        case 'lastVisit':
          aValue = new Date(a.lastVisit).getTime();
          bValue = new Date(b.lastVisit).getTime();
          break;
        default:
          aValue = a.totalVisits;
          bValue = b.totalVisits;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return ips;
  }, [uniqueIPs, humanIPs, botIPs, searchTerm, sortField, sortOrder, activeTab]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      timeZone: 'America/Kentucky/Louisville',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLeadIndicator = (ip: UniqueIPSummary): boolean => {
    // Consider an IP a lead if they have high engagement and multiple sessions
    return ip.engagementScore >= 70 && ip.sessions >= 2 && ip.totalVisits >= 5;
  };

  const handleIPClick = (ipAddress: string) => {
    router.push(`/analytics/ip/${ipAddress}`);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExportLoading(format);

    try {
      // Debug: Log the data being exported
      console.log('Exporting data:', {
        format,
        displayIPs,
        count: displayIPs.length,
        activeTab
      });

      if (displayIPs.length === 0) {
        alert('No data to export. Please check your filters or date range.');
        return;
      }

      if (format === 'csv') {
        const csvContent = exportUniqueIPsToCSV(displayIPs);
        downloadCSV(csvContent, `unique-ips-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        exportUniqueIPsToXLSX(displayIPs);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search IP addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visits">Visits</SelectItem>
              <SelectItem value="sessions">Sessions</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="lastVisit">Last Visit</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            disabled={exportLoading === 'csv'}
            size="sm"
            variant="outline"
          >
            {exportLoading === 'csv' ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            onClick={() => handleExport('xlsx')}
            disabled={exportLoading === 'xlsx'}
            variant="outline"
            size="sm"
          >
            {exportLoading === 'xlsx' ? 'Exporting...' : 'Export XLSX'}
          </Button>
          <Button
            onClick={testXLSXExport}
            variant="outline"
            size="sm"
            className="bg-yellow-100 hover:bg-yellow-200"
          >
            Test XLSX
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'human' | 'bot')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({uniqueIPs.length})</TabsTrigger>
          <TabsTrigger value="human">Human ({humanIPs?.length || 0})</TabsTrigger>
          <TabsTrigger value="bot">Bot ({botIPs?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <IPList ips={displayIPs} onIPClick={handleIPClick} formatDate={formatDate} getEngagementColor={getEngagementColor} getLeadIndicator={getLeadIndicator} />
        </TabsContent>

        <TabsContent value="human" className="space-y-4">
          <IPList ips={displayIPs} onIPClick={handleIPClick} formatDate={formatDate} getEngagementColor={getEngagementColor} getLeadIndicator={getLeadIndicator} />
        </TabsContent>

        <TabsContent value="bot" className="space-y-4">
          <IPList ips={displayIPs} onIPClick={handleIPClick} formatDate={formatDate} getEngagementColor={getEngagementColor} getLeadIndicator={getLeadIndicator} />
        </TabsContent>
      </Tabs>

      {displayIPs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            {searchTerm ? 'No IP addresses found matching your search.' : 'No IP addresses found.'}
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-gray-600 text-center">
        Showing {displayIPs.length} of {uniqueIPs.length} unique IP addresses
      </div>
    </div>
  );
}

interface IPListProps {
  ips: UniqueIPSummary[];
  onIPClick: (ipAddress: string) => void;
  formatDate: (dateString: string) => string;
  getEngagementColor: (score: number) => string;
  getLeadIndicator: (ip: UniqueIPSummary) => boolean;
}

function IPList({ ips, onIPClick, formatDate, getEngagementColor, getLeadIndicator }: IPListProps) {
  return (
    <div className="space-y-2">
      {ips.map((ip) => (
        <Card key={ip.ipAddress} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onIPClick(ip.ipAddress)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{ip.ipAddress}</span>
                  {getLeadIndicator(ip) && (
                    <Badge variant="default" className="bg-green-500 text-white text-xs">
                      Lead
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {ip.totalVisits} visits • {ip.sessions} sessions • Last: {formatDate(ip.lastVisit)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getEngagementColor(ip.engagementScore)}`}></div>
                  <span className="text-xs">{ip.engagementScore}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}