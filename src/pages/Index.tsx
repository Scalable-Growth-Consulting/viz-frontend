
import React, { useState } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';
import Login from '../components/Login';

const Index = () => {
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // In a real app, this would come from auth state
  const [activeTab, setActiveTab] = useState<'answer' | 'sql' | 'charts'>('answer');
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);

  const handleQuerySubmit = (query: string) => {
    setIsLoading(true);
    
    // Simulate API call
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
      
      setQueryResult(result);
      setSqlQuery(sql);
      setIsLoading(false);
    }, 1200);
  };

  const handleTabChange = (tab: 'answer' | 'sql' | 'charts') => {
    setActiveTab(tab);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // If user is not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-viz-dark">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ChatInterface onQuerySubmit={handleQuerySubmit} />
          </div>
          <div className="lg:col-span-2 h-[calc(100vh-12rem)]">
            <ResultsArea 
              queryResult={activeTab === 'sql' ? sqlQuery : queryResult} 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      </main>
      <footer className="bg-viz-dark text-white text-center py-4 text-sm">
        <p className="text-viz-text-secondary">© 2025 Viz • Powered by Advanced Business Intelligence AI</p>
      </footer>
    </div>
  );
};

export default Index;
