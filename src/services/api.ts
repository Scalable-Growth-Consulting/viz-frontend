
// Response types
export interface QueryResponse {
  result: string | null;
  sql: string | null;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: any;
}

// API Service
const ApiService = {
  // Process a user query and get results
  processQuery: async (query: string): Promise<QueryResponse> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = null;
        let sql = null;
        
        if (query.includes("revenue")) {
          result = "Based on the data analysis, California has the highest revenue at $2.4M, followed by New York at $1.8M and Texas at $1.5M. The lowest revenue was recorded in Wyoming at $120K.";
          sql = "SELECT state, SUM(revenue) as total_revenue\nFROM sales\nGROUP BY state\nORDER BY total_revenue DESC;";
        } else if (query.includes("Delivery Performance")) {
          result = "The overall delivery performance shows a 94.7% on-time delivery rate across all regions. The average delivery time is 2.3 days, with express shipping averaging 1.1 days.";
          sql = "SELECT\n  COUNT(CASE WHEN status = 'on-time' THEN 1 END) * 100.0 / COUNT(*) as on_time_percentage,\n  AVG(delivery_time) as avg_delivery_time,\n  AVG(CASE WHEN shipping_method = 'express' THEN delivery_time END) as avg_express_time\nFROM deliveries;";
        } else if (query.includes("GMV") && query.includes("orders")) {
          result = "California: GMV $3.2M, 24,500 orders\nNew York: GMV $2.7M, 21,300 orders\nTexas: GMV $2.1M, 18,900 orders\nFlorida: GMV $1.9M, 16,200 orders";
          sql = "SELECT\n  state,\n  SUM(order_value) as gmv,\n  COUNT(*) as total_orders\nFROM orders\nGROUP BY state\nORDER BY gmv DESC\nLIMIT 4;";
        } else if (query.includes("GMV") && query.includes("month")) {
          result = "January: $1.4M\nFebruary: $1.6M\nMarch: $2.1M\nApril: $1.9M\nMay: $2.3M\nJune: $2.5M";
          sql = "SELECT\n  EXTRACT(MONTH FROM order_date) as month,\n  SUM(order_value) as monthly_gmv\nFROM orders\nWHERE EXTRACT(YEAR FROM order_date) = 2025\nGROUP BY month\nORDER BY month;";
        } else {
          result = `Analysis for: "${query}"\n\nPlease provide more specific information about what you're looking for in the data.`;
          sql = "-- No specific SQL generated for this query\n-- Please refine your question to get specific data";
        }
        
        resolve({
          result,
          sql,
        });
      }, 1200);
    });
  },

  // Get chart data based on query
  getChartData: async (query: string): Promise<ChartData | null> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would be returned from the API
        // For now, we'll return mock data
        resolve({
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Revenue',
                data: [1.4, 1.6, 2.1, 1.9, 2.3, 2.5],
                backgroundColor: '#9b87f5'
              }
            ]
          }
        });
      }, 800);
    });
  }
};

export default ApiService;
