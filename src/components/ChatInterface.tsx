
import React, { useState, useRef } from 'react';
import { SendIcon, LightbulbIcon, SearchIcon } from 'lucide-react';
import QueryButton from './QueryButton';

interface ChatInterfaceProps {
  onQuerySubmit: (query: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onQuerySubmit }) => {
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
    if (query.trim()) {
      onQuerySubmit(query);
      setQuery('');
    }
  };

  const handleQuickQuery = (text: string) => {
    onQuerySubmit(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-viz-dark dark:text-white">
          <LightbulbIcon className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold">Quick Queries</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQueries.map((queryText, index) => (
            <QueryButton 
              key={index} 
              text={queryText} 
              onClick={() => handleQuickQuery(queryText)} 
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="viz-input pr-12"
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <button
              type="submit"
              className="viz-button-primary !p-2"
              disabled={!query.trim()}
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
