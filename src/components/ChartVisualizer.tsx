
import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Sample data for different chart types
const revenueByStateData = [
  { name: 'California', value: 2400 },
  { name: 'New York', value: 1800 },
  { name: 'Texas', value: 1500 },
  { name: 'Florida', value: 1300 },
  { name: 'Illinois', value: 900 },
  { name: 'Wyoming', value: 120 }
];

const deliveryPerformanceData = [
  { name: 'Standard', on_time: 92, delayed: 8 },
  { name: 'Express', on_time: 98, delayed: 2 },
  { name: 'Economy', on_time: 86, delayed: 14 },
  { name: 'Overnight', on_time: 94, delayed: 6 }
];

const monthlyGmvData = [
  { name: 'Jan', value: 1400 },
  { name: 'Feb', value: 1600 },
  { name: 'Mar', value: 2100 },
  { name: 'Apr', value: 1900 },
  { name: 'May', value: 2300 },
  { name: 'Jun', value: 2500 }
];

// Colors for charts
const COLORS = [
  '#9b87f5', '#F97316', '#0EA5E9', '#8B5CF6', 
  '#7E69AB', '#22D3EE', '#D6BCFA', '#ea384c'
];

interface ChartVisualizerProps {
  queryResult: string | null;
}

const ChartVisualizer: React.FC<ChartVisualizerProps> = ({ queryResult }) => {
  // Function to determine which chart to render based on the query result
  const getChartType = () => {
    if (!queryResult) return null;
    
    if (queryResult.includes("California") && queryResult.includes("revenue")) {
      return "revenueByState";
    } else if (queryResult.includes("delivery performance")) {
      return "deliveryPerformance";
    } else if (queryResult.includes("GMV") && queryResult.includes("month")) {
      return "monthlyGmv";
    }
    return null;
  };

  const chartType = getChartType();
  
  const renderChart = () => {
    switch (chartType) {
      case "revenueByState":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Revenue by State</h3>
            <div className="h-[400px]">
              <ChartContainer 
                config={{
                  revenue: {
                    label: "Revenue",
                    theme: { light: "#9b87f5", dark: "#9b87f5" }
                  }
                }}
              >
                <BarChart data={revenueByStateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                  <ChartTooltip 
                    content={({ active, payload }) => 
                      active && payload && payload.length ? (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-medium">{payload[0].payload.name}</div>
                          <div className="text-muted-foreground">${payload[0].value}k</div>
                        </div>
                      ) : null 
                    } 
                  />
                  <Bar dataKey="value" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        );
        
      case "deliveryPerformance":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Delivery Performance</h3>
            <div className="h-[400px]">
              <ChartContainer 
                config={{
                  onTime: { 
                    label: "On Time",
                    theme: { light: "#0EA5E9", dark: "#0EA5E9" }
                  },
                  delayed: { 
                    label: "Delayed",
                    theme: { light: "#F97316", dark: "#F97316" }
                  }
                }}
              >
                <BarChart data={deliveryPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="on_time" fill="var(--color-onTime)" name="On Time" stackId="a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayed" fill="var(--color-delayed)" name="Delayed" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        );

      case "monthlyGmv":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Monthly GMV Trend</h3>
            <div className="h-[400px]">
              <ChartContainer 
                config={{
                  gmv: { 
                    label: "GMV",
                    theme: { light: "#8B5CF6", dark: "#8B5CF6" }
                  }
                }}
              >
                <LineChart data={monthlyGmvData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                  <ChartTooltip 
                    content={({ active, payload }) => 
                      active && payload && payload.length ? (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-medium">{payload[0].payload.name}</div>
                          <div className="text-muted-foreground">${payload[0].value}k</div>
                        </div>
                      ) : null 
                    } 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-gmv)" 
                    strokeWidth={2} 
                    dot={{ fill: "var(--color-gmv)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center text-viz-text-secondary">
              <p className="text-lg font-medium mb-4">No chart data available</p>
              <p className="text-sm">Try a different query to generate chart visualizations</p>
              <p className="text-sm mt-2">
                Suggested queries: "Show revenue by state", "Show delivery performance", 
                "Show GMV by month"
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      {renderChart()}
    </div>
  );
};

export default ChartVisualizer;
