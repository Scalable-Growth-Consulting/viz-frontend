import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, LightbulbIcon } from 'lucide-react';
import QueryButton from './QueryButton';
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import RateLimitModal from './RateLimitModal';

interface ChatInterfaceProps {
  onQuerySubmit: (query: string) => Promise<void> | void;
  quickQueries?: string[];
  isLoading?: boolean;
  onRateLimitHit?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onQuerySubmit, quickQueries, isLoading = false, onRateLimitHit }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);

  // Per-user, per-day storage key
  const storageKey = React.useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const uid = user?.id || 'anon';
    return `chatMessageCount:${uid}:${yyyy}-${mm}-${dd}`;
  }, [user?.id]);

  // Persist message count per user per day
  const [messageCount, setMessageCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // When user/date key changes, load fresh count
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setMessageCount(saved ? parseInt(saved, 10) : 0);
    } catch {
      setMessageCount(0);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, messageCount.toString());
    } catch {}
  }, [messageCount, storageKey]);

  const defaultQuickQueries = [
    "Give me total revenue per state",
    "Tell me about overall Delivery Performance",
    "Give me GMV and total number of orders for each state",
    "Give me GMV for each month"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (messageCount >= 5) {
      setShowRateLimitModal(true);
      onRateLimitHit?.();
      return;
    }

    if (query.trim() && !isLoading) {
      onQuerySubmit(query);
      setMessageCount(messageCount + 1);
    } else if (!query.trim()) {
      toast("Please enter a query first");
    }
  };

  const handleQuickQuery = (text: string) => {
    if (messageCount >= 5) {
      setShowRateLimitModal(true);
      onRateLimitHit?.();
      return;
    }

    setQuery(text);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (!isLoading) {
      onQuerySubmit(text);
      setMessageCount(messageCount + 1);
    }
  };


  return (
    <div className="flex flex-col space-y-6">
      {/* Quick Queries */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-viz-dark dark:text-white">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <LightbulbIcon className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold">Quick Queries</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {(quickQueries ?? defaultQuickQueries).map((queryText, index) => (
            <QueryButton 
              key={index} 
              text={queryText} 
              onClick={handleQuickQuery} 
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Input Box */}
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
          {/* Usage counter - subtle, right-aligned */}
          <div className="absolute right-2 -bottom-6 text-[11px] text-muted-foreground select-none flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 border bg-background/60 ${messageCount >= 5 ? 'border-rose-200 text-rose-600' : 'border-gray-200'} `}>
              {messageCount}/5
            </span>
            <span className="opacity-60">messages daily</span>
          </div>
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

      {/* Rate Limit Modal */}
      <RateLimitModal 
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
      />
    </div>
  );
};

export default ChatInterface;
