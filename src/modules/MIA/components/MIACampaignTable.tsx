import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Edit,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Campaign } from '../types';

interface MIACampaignTableProps {
  campaigns: Campaign[];
}

const MIACampaignTable: React.FC<MIACampaignTableProps> = ({ campaigns }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof Campaign>('roas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier;
      }
      
      return String(aValue).localeCompare(String(bValue)) * modifier;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Paused</Badge>;
      case 'ended':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Ended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      meta: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      google: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      linkedin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      tiktok: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    
    return (
      <Badge className={colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {platform.toUpperCase()}
      </Badge>
    );
  };

  const getROASIndicator = (roas: number) => {
    if (roas > 200) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (roas < 100) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const handleSort = (column: keyof Campaign) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortableHeader: React.FC<{ column: keyof Campaign; children: React.ReactNode }> = ({ 
    column, 
    children 
  }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === column && (
          sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
        )}
      </div>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-viz-accent" />
          Campaign Performance
          <Badge variant="secondary" className="ml-auto">
            {filteredCampaigns.length} campaigns
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="meta">Meta</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="name">Campaign</SortableHeader>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <SortableHeader column="spend">Spend</SortableHeader>
                <SortableHeader column="impressions">Impressions</SortableHeader>
                <SortableHeader column="clicks">Clicks</SortableHeader>
                <SortableHeader column="ctr">CTR</SortableHeader>
                <SortableHeader column="conversions">Conversions</SortableHeader>
                <SortableHeader column="cpa">CPA</SortableHeader>
                <SortableHeader column="roas">ROAS</SortableHeader>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-viz-dark dark:text-white">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {campaign.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlatformBadge(campaign.platform)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(campaign.spend)}</div>
                      <div className="text-xs text-muted-foreground">
                        of {formatCurrency(campaign.budget)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatNumber(campaign.impressions)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatNumber(campaign.clicks)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{formatPercentage(campaign.ctr)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatNumber(campaign.conversions)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCurrency(campaign.cpa)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-medium ${
                        campaign.roas > 200 ? 'text-green-600' :
                        campaign.roas > 150 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {formatPercentage(campaign.roas)}
                      </span>
                      {getROASIndicator(campaign.roas)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Pause Campaign
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Resume Campaign
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Open in {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns found matching your filters.</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MIACampaignTable;
