
import React, { useState, useRef } from 'react';
import { SendIcon, LightbulbIcon } from 'lucide-react';
import QueryButton from './QueryButton';

interface ChatInterfaceProps {
  onQuerySubmit: (query: string) => void;
  isLoading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onQuerySubmit, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQueries = [
    "Give me total revenue per state",
    "Tell me about overall Delivery Performance",
    "Give me GMV and total number of orders for each state",
    "Give me GMV for each month"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuerySubmit(query);
    }
  };

  const handleQuickQuery = (text: string) => {
    setQuery(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-viz-dark dark:text-white">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <LightbulbIcon className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold">Quick Queries</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {quickQueries.map((queryText, index) => (
            <QueryButton 
              key={index} 
              text={queryText} 
              onClick={handleQuickQuery} 
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="viz-input pr-12 bg-opacity-70 backdrop-blur-sm"
            placeholder="Ask something about your data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <button
              type="submit"
              className={`viz-button-primary !p-2 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
              disabled={!query.trim() || isLoading}
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
