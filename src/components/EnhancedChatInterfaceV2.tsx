import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send, RefreshCw, Trash2, Code, BarChart2, AlertCircle, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    sql?: string;
    chartCode?: string | null;
    data?: any;
  };
}

interface EnhancedChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  isProcessing: boolean;
  messages: Message[];
  onRegenerate: () => void;
  onClearChat: () => void;
  faqs?: string[];
}

const EnhancedChatInterfaceV2: React.FC<EnhancedChatInterfaceProps> = ({
  onSendMessage,
  isProcessing,
  messages,
  onRegenerate,
  onClearChat,
  faqs = []
}) => {
  const [message, setMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Per-user per-day storage key
  const storageKey = React.useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const uid = user?.id || 'anon';
    return `chatMessageCount:${uid}:${yyyy}-${mm}-${dd}`;
  }, [user?.id]);

  const [messageCount, setMessageCount] = React.useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Refresh count when user/date key changes
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setMessageCount(saved ? parseInt(saved, 10) : 0);
    } catch {
      setMessageCount(0);
    }
  }, [storageKey]);

  // Persist changes
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(messageCount));
    } catch {}
  }, [messageCount, storageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;
    if (messageCount >= 5) {
      toast("🚫 You have reached your 5 message limit.");
      return;
    }
    
    await onSendMessage(message);
    setMessageCount((c) => c + 1);
    setMessage('');
  };

  // Auto-scroll to bottom of messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Data-availability helpers (consistent with other components)
  const isDataNotAvailable = (content: string | null | undefined) => {
    if (!content) return false;
    const lowerContent = content.toLowerCase();
    const hasNoDataIndicators = lowerContent.includes('no data found') ||
                                lowerContent.includes('data not available') ||
                                lowerContent.includes('dataset is empty') ||
                                lowerContent.includes('no results') ||
                                lowerContent.includes('empty dataset') ||
                                lowerContent.includes('no data available');
    const hasActualData = /\d+/.test(content) ||
                          content.includes('|') ||
                          content.includes('Total') ||
                          content.includes('Revenue') ||
                          content.includes('Orders') ||
                          content.includes('State') ||
                          content.includes('Month') ||
                          content.length > 200;
    return hasNoDataIndicators && !hasActualData;
  };

  const isTableUnavailable = (content: string | null | undefined) => {
    if (!content) return false;
    const lower = content.toLowerCase();
    const tableIndicators = [
      'table not found',
      'not found: table',
      'table does not exist',
      'no such table',
      'missing table',
      'dataset not found',
      'not found: dataset',
      'dataset does not exist',
      'table unavailable',
      'no table available'
    ];
    const hasIndicator = tableIndicators.some(p => lower.includes(p));
    const hasActualData = /\d+/.test(content) ||
                          content.includes('|') ||
                          content.includes('Total') ||
                          content.includes('Revenue') ||
                          content.includes('Orders') ||
                          content.includes('State') ||
                          content.includes('Month') ||
                          content.length > 200;
    return hasIndicator && !hasActualData;
  };

  const DataNotAvailableMessage: React.FC = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Data not available, please add data</span>
        </div>
        <button
          onClick={() => navigate('/data-control')}
          className="inline-flex items-center space-x-2 rounded border px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Data</span>
        </button>
      </div>
    </div>
  );

  const TableUnavailableMessage: React.FC = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Required data table is missing or unavailable</span>
        </div>
        <button
          onClick={() => navigate('/table-explorer')}
          className="inline-flex items-center space-x-2 rounded border px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-300"
        >
          <Plus className="h-4 w-4" />
          <span>Open Table Explorer</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-viz-text-secondary p-8">
            <h3 className="text-lg font-medium mb-2">Welcome to Business Intelligence</h3>
            <p className="mb-6">Ask questions about your data in natural language</p>
            
            {faqs.length > 0 && (
              <div className="w-full max-w-md space-y-2">
                <p className="text-sm font-medium">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {faqs.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (messageCount >= 5) {
                          toast("🚫 You have reached your 5 message limit.");
                          return;
                        }
                        setMessage(faq);
                      }}
                      className="text-sm p-3 text-left rounded-lg border border-slate-200 dark:border-viz-light/10 hover:bg-slate-50 dark:hover:bg-viz-medium/50 transition-colors"
                    >
                      {faq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl w-full rounded-lg overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-viz-accent/10 text-viz-dark dark:bg-viz-accent/20 dark:text-white'
                      : 'bg-white dark:bg-viz-medium/50 text-viz-dark dark:text-white shadow-sm border border-slate-200 dark:border-viz-light/10'
                  }`}
                >
                  <div className="p-4">
                    <div className="prose dark:prose-invert max-w-none">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                  
                  {/* Show SQL and Chart tabs if metadata exists */}
                  {msg.role === 'assistant' && msg.metadata && (
                    <div className="border-t border-slate-200 dark:border-viz-light/10">
                      <Tabs defaultValue="answer" className="w-full">
                        <TabsList className="w-full rounded-none border-b border-slate-200 dark:border-viz-light/10 bg-transparent">
                          <TabsTrigger value="answer" className="text-xs py-1 h-8">Answer</TabsTrigger>
                          {msg.metadata.sql && (
                            <TabsTrigger value="sql" className="text-xs py-1 h-8 flex items-center gap-1">
                              <Code className="h-3 w-3" /> SQL
                            </TabsTrigger>
                          )}
                          {msg.metadata?.chartCode && (
                            <TabsTrigger value="chart" className="text-xs py-1 h-8 flex items-center gap-1">
                              <BarChart2 className="h-3 w-3" /> Chart
                            </TabsTrigger>
                          )}
                        </TabsList>
                        
                        <TabsContent value="answer" className="p-0 m-0">
                          <div className="p-4">
                            {isTableUnavailable(msg.content) ? (
                              <TableUnavailableMessage />
                            ) : isDataNotAvailable(msg.content) ? (
                              <DataNotAvailableMessage />
                            ) : (
                              <div className="prose dark:prose-invert max-w-none">
                                {msg.content.split('\n').map((line, i) => (
                                  <p key={i}>{line}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        {msg.metadata?.sql && (
                          <TabsContent value="sql" className="p-4 m-0 bg-slate-50 dark:bg-viz-dark/30">
                            {(() => {
                              const sql = msg.metadata!.sql as string;
                              if (isTableUnavailable(sql)) return <TableUnavailableMessage />;
                              if (isDataNotAvailable(sql)) return <DataNotAvailableMessage />;
                              return (
                                <pre className="text-xs overflow-x-auto p-3 bg-white dark:bg-viz-dark/50 rounded">
                                  <code>{sql}</code>
                                </pre>
                              );
                            })()}
                          </TabsContent>
                        )}
                        
                        {msg.metadata.chartCode && (
                          <TabsContent value="chart" className="p-4 m-0 bg-slate-50 dark:bg-viz-dark/30">
                            <div className="bg-white dark:bg-viz-dark/50 p-4 rounded">
                              <div className="h-64 flex items-center justify-center text-slate-500 dark:text-viz-text-secondary">
                                Chart preview would be displayed here
                              </div>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 dark:border-viz-light/10 p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-viz-text-secondary text-center mb-2">Messages used: {messageCount}/5</div>
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question about your data..."
                className="min-h-[60px] max-h-32 pr-12 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isProcessing || messageCount >= 5}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8"
                disabled={!message.trim() || isProcessing || messageCount >= 5}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {messages.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onRegenerate}
                    disabled={isProcessing || messages.length === 0 || messageCount >= 5}
                    title="Regenerate last response"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onClearChat}
                    disabled={isProcessing}
                    title="Clear chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-viz-text-secondary text-center">
            {isProcessing ? 'Processing...' : 'Press Enter to send, Shift+Enter for a new line'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default EnhancedChatInterfaceV2;
