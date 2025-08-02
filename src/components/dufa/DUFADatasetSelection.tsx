import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Database, 
  Search, 
  Calendar, 
  BarChart3, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/pages/DUFA';

interface DUFADatasetSelectionProps {
  selectedDatasets: Dataset[];
  onDatasetsChange: (datasets: Dataset[]) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const DUFADatasetSelection: React.FC<DUFADatasetSelectionProps> = ({
  selectedDatasets,
  onDatasetsChange,
  loading,
  onLoadingChange
}) => {
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'large'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableDatasets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAvailableDatasets = async () => {
    onLoadingChange(true);
    try {
      // Mock data for now - in real implementation, this would fetch from BigQuery
      const mockDatasets: Dataset[] = [
        {
          id: '1',
          name: 'Sales Data 2023-2024',
          table_name: 'sales_data_2023_2024',
          rows: 15420,
          columns: ['date', 'product_id', 'quantity', 'revenue', 'region'],
          last_updated: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Customer Orders',
          table_name: 'customer_orders',
          rows: 8750,
          columns: ['order_date', 'customer_id', 'order_value', 'status'],
          last_updated: '2024-01-14T16:45:00Z'
        },
        {
          id: '3',
          name: 'Product Inventory',
          table_name: 'product_inventory',
          rows: 2340,
          columns: ['date', 'product_id', 'stock_level', 'reorder_point'],
          last_updated: '2024-01-13T09:15:00Z'
        },
        {
          id: '4',
          name: 'Marketing Campaigns',
          table_name: 'marketing_campaigns',
          rows: 1250,
          columns: ['campaign_date', 'channel', 'spend', 'impressions', 'clicks'],
          last_updated: '2024-01-12T14:20:00Z'
        }
      ];

      setAvailableDatasets(mockDatasets);
      toast({
        title: "Datasets loaded",
        description: `Found ${mockDatasets.length} available datasets`,
      });
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast({
        title: "Error loading datasets",
        description: "Failed to fetch available datasets. Please try again.",
        variant: "destructive",
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleDatasetToggle = (dataset: Dataset) => {
    const isSelected = selectedDatasets.some(d => d.id === dataset.id);
    
    if (isSelected) {
      onDatasetsChange(selectedDatasets.filter(d => d.id !== dataset.id));
    } else {
      onDatasetsChange([...selectedDatasets, dataset]);
    }
  };

  const filteredDatasets = availableDatasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filterType) {
      case 'recent': {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(dataset.last_updated).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceUpdate <= 7;
      }
      case 'large':
        return dataset.rows > 5000;
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-viz-accent mx-auto mb-4" />
          <p className="text-slate-600 dark:text-viz-text-secondary">Loading available datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-2">
          Select Datasets for Forecasting
        </h2>
        <p className="text-slate-600 dark:text-viz-text-secondary">
          Choose one or more datasets from your uploaded BigQuery tables to analyze and forecast.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('recent')}
          >
            Recent
          </Button>
          <Button
            variant={filterType === 'large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('large')}
          >
            Large (5K+ rows)
          </Button>
        </div>
      </div>

      {/* Selected Datasets Summary */}
      {selectedDatasets.length > 0 && (
        <Card className="bg-viz-accent/5 border-viz-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-viz-accent" />
              <h3 className="font-semibold text-viz-dark dark:text-white">
                Selected Datasets ({selectedDatasets.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDatasets.map(dataset => (
                <Badge key={dataset.id} className="bg-viz-accent text-white">
                  {dataset.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Datasets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDatasets.map(dataset => {
          const isSelected = selectedDatasets.some(d => d.id === dataset.id);
          
          return (
            <Card 
              key={dataset.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-viz-accent bg-viz-accent/5' 
                  : 'hover:bg-slate-50 dark:hover:bg-viz-medium/50'
              }`}
              onClick={() => handleDatasetToggle(dataset)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleDatasetToggle(dataset)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-viz-text-secondary">
                        {dataset.table_name}
                      </p>
                    </div>
                  </div>
                  <Database className="w-5 h-5 text-viz-accent" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-viz-text-secondary">
                      {formatNumber(dataset.rows)} rows
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-viz-text-secondary">
                      {formatDate(dataset.last_updated)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-white mb-2">
                    Columns ({dataset.columns.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {dataset.columns.slice(0, 3).map(column => (
                      <Badge key={column} variant="secondary" className="text-xs">
                        {column}
                      </Badge>
                    ))}
                    {dataset.columns.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{dataset.columns.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDatasets.length === 0 && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">
            No datasets found
          </h3>
          <p className="text-slate-500 dark:text-viz-text-secondary">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload some datasets first to get started with forecasting.'
            }
          </p>
          {(searchTerm || filterType !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default DUFADatasetSelection;
