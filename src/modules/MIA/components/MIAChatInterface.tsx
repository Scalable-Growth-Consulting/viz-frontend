import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { useMIAChat } from '../hooks/useMIAChat';

interface ChatMessage {
  id: string;
  query?: string;
  response: string;
  timestamp: string;
  userId: string;
  insights?: Array<{
    title: string;
    severity: string;
    recommendation: string;
  }>;
}

interface MIAChatInterfaceProps {}

const MIAChatInterface: React.FC<MIAChatInterfaceProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { sendMessage, isLoading } = useMIAChat();

  // Suggested queries
  const suggestedQueries = [
    "What's my current ROAS across all campaigns?",
    "Which campaigns are underperforming?",
    "How can I optimize my ad spend?",
    "Show me insights for my Google Ads",
    "Compare Meta vs Google performance",
    "What's my best performing demographic?",
    "How to improve my conversion rate?",
    "Identify budget optimization opportunities"
  ];

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      response: "👋 Hi! I'm your Marketing Intelligence Agent. I can help you analyze campaign performance, optimize ad spend, and provide actionable insights. Try asking me about your ROAS, campaign comparisons, or optimization recommendations!",
      timestamp: new Date().toISOString(),
      userId: 'system',
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (query: string = inputValue) => {
    if (!query.trim() || isLoading) return;

    setInputValue('');

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      query: query,
      response: query,
      timestamp: new Date().toISOString(),
      userId: 'user',
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await sendMessage({
        message: query,
        userId: 'anonymous',
        timestamp: new Date().toISOString(),
        context: 'marketing_intelligence'
      });
      
      // Convert response to ChatMessage format
      const chatResponse: ChatMessage = {
        id: response.id,
        query: query,
        response: response.response,
        timestamp: response.timestamp,
        userId: 'system',
        insights: response.insights
      };
      
      setMessages(prev => [...prev, chatResponse]);
    } catch (error) {
      console.error('Error processing query:', error);
      
      let errorMessage = 'Failed to process your query. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Backend URL not configured')) {
          errorMessage = 'Chat service is not configured. Please contact support.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('timeout') || error.message.includes('fetch')) {
          errorMessage = 'Connection timeout. Please check your internet connection.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        response: `❌ ${errorMessage}`,
        timestamp: new Date().toISOString(),
        userId: 'system',
      };
      setMessages(prev => [...prev, errorChatMessage]);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
    handleSendMessage(query);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.userId === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-viz-accent rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div
            className={`rounded-lg p-3 ${
              isUser
                ? 'bg-viz-accent text-white ml-auto'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="space-y-2">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.response}
                </div>
              </div>
              
              {message.insights && message.insights.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Related Insights:
                  </div>
                  {message.insights.slice(0, 2).map((insight, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-medium">{insight.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {insight.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-viz-accent" />
          AI Marketing Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(renderMessage)}
            
            {isLoading && (
              <div className="flex gap-3 justify-start mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-viz-accent rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Analyzing your marketing data...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Queries */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Try asking me:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQueries.slice(0, 4).map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-2 text-xs"
                    onClick={() => handleSuggestedQuery(query)}
                  >
                    <div className="flex items-center gap-2">
                      {query.includes('ROAS') || query.includes('ROI') ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : query.includes('campaign') ? (
                        <Target className="w-3 h-3" />
                      ) : query.includes('budget') || query.includes('spend') ? (
                        <DollarSign className="w-3 h-3" />
                      ) : (
                        <BarChart3 className="w-3 h-3" />
                      )}
                      <span className="truncate">{query}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your marketing performance..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MIAChatInterface;
