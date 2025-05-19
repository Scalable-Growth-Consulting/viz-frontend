
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';
import Login from '../components/Login';
import ApiService, { QueryResponse, ChartData } from '../services/api';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  // State for query results
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  
  // Loading states
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // UI states
  const [isLoggedIn, setIsLoggedIn] = useState(false); // In a real app, this would come from auth state
  const [activeTab, setActiveTab] = useState<'answer' | 'sql' | 'charts'>('answer');
  
  const { toast } = useToast();

  // Handle user query submission
  const handleQuerySubmit = async (query: string) => {
    setIsQueryLoading(true);
    
    try {
      // First API call - Get query result and SQL
      const response: QueryResponse = await ApiService.processQuery(query);
      setQueryResult(response.result);
      setSqlQuery(response.sql);
      
      // Second API call - Get chart data
      setIsChartLoading(true);
      const chartResponse = await ApiService.getChartData(query);
      setChartData(chartResponse);
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: "Query failed",
        description: "There was a problem processing your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsQueryLoading(false);
      setIsChartLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'answer' | 'sql' | 'charts') => {
    if (isQueryLoading) {
      // Don't allow tab changes during initial query loading
      return;
    }
    
    setActiveTab(tab);
    
    // If we're switching to charts and don't have chart data yet, show loading state
    if (tab === 'charts' && !chartData && queryResult) {
      setIsChartLoading(true);
      
      // Simulate loading charts (would be a real API call in production)
      ApiService.getChartData(queryResult).then(data => {
        setChartData(data);
        setIsChartLoading(false);
      });
    }
  };

  // Handle user login
  const handleLogin = () => {
    setIsLoggedIn(true);
    toast({
      title: "Welcome to Viz",
      description: "You're now logged in to the dashboard",
    });
  };

  // If user is not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-white dark:bg-viz-medium backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 dark:border-viz-light/20 p-5 animate-fade-in">
              <ChatInterface 
                onQuerySubmit={handleQuerySubmit} 
                isLoading={isQueryLoading}
              />
            </div>
          </div>
          <div className="lg:col-span-2 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
            <ResultsArea 
              queryResult={activeTab === 'sql' ? sqlQuery : queryResult} 
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isLoading={isQueryLoading}
              isChartLoading={isChartLoading}
            />
          </div>
        </div>
      </main>
      <footer className="bg-viz-dark text-white text-center py-3 text-sm">
        <p className="text-viz-text-secondary">© 2025 Viz • Powered by Advanced Business Intelligence AI</p>
      </footer>
    </div>
  );
};

export default Index;
