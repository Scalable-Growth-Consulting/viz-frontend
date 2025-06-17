import React from 'react';
import Header from '../components/Header';
import { LightbulbIcon, SearchIcon, BarChartIcon, DatabaseIcon } from 'lucide-react';

const Tips = () => {
  const tips = [
    {
      title: "Be Specific",
      icon: <SearchIcon className="w-6 h-6 text-viz-accent" />,
      description: "Rather than asking 'Show me data', try 'Show me monthly revenue by product category for Q1 2025'."
    },
    {
      title: "Include Time Periods",
      icon: <BarChartIcon className="w-6 h-6 text-viz-accent" />,
      description: "Specify timeframes like 'last month', 'YTD', 'Q2', or date ranges for more relevant insights."
    },
    {
      title: "Specify Metrics",
      icon: <DatabaseIcon className="w-6 h-6 text-viz-accent" />,
      description: "Use specific metric names from your data (e.g., GMV, Revenue, Conversion Rate) rather than general terms."
    },
    {
      title: "Request Comparisons",
      icon: <BarChartIcon className="w-6 h-6 text-viz-accent" />,
      description: "Ask for comparisons like 'Compare this month's sales to last month' or 'Show year-over-year growth'."
    },
    {
      title: "Refine Your Results",
      icon: <SearchIcon className="w-6 h-6 text-viz-accent" />,
      description: "If initial results aren't what you expected, try to refine your query with more specific criteria."
    },
    {
      title: "Explore Visualizations",
      icon: <BarChartIcon className="w-6 h-6 text-viz-accent" />,
      description: "Try asking for specific chart types: 'Show me a pie chart of revenue by region' or 'Create a trend line of monthly active users'."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-viz-dark">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="viz-card p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-viz-accent/10 p-3 rounded-full">
              <LightbulbIcon className="w-7 h-7 text-viz-accent" />
            </div>
            <h1 className="text-2xl font-bold">Tips for Getting Better Insights</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 dark:border-viz-light bg-white dark:bg-viz-medium hover:shadow-md transition-all">
                <div className="bg-viz-accent/10 dark:bg-viz-accent/20 p-3 inline-flex rounded-full mb-3">
                  {tip.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">{tip.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-viz-accent/5 dark:bg-viz-accent/10 rounded-lg border border-viz-accent/20">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <LightbulbIcon className="w-5 h-5 text-amber-400 mr-2" />
              Pro Tip
            </h3>
            <p className="text-slate-600 dark:text-viz-text-secondary">
              You can create custom KPIs in the Control Panel to make them accessible to Viz. This helps the AI understand your business-specific metrics and provide more accurate analyses.
            </p>
          </div>
        </div>
      </main>
      <footer className="bg-viz-dark text-white text-center py-4 text-sm">
        <p className="text-viz-text-secondary">© 2025 Viz • Powered by Advanced Business Intelligence AI</p>
      </footer>
    </div>
  );
};

export default Tips;

