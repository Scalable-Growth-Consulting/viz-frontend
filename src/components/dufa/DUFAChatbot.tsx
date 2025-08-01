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
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Dataset, ForecastConfig, ForecastResult } from '@/pages/DUFA';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface DUFAChatbotProps {
  forecastResults: ForecastResult[];
  bestModel: ForecastResult | null;
  datasets: Dataset[];
  config: ForecastConfig;
  onMessagesUpdate?: (messages: Message[]) => void;
}

const DUFAChatbot: React.FC<DUFAChatbotProps> = ({
  forecastResults,
  bestModel,
  datasets,
  config
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const suggestedQuestions = [
    "Why did the model choose this forecast trend?",
    "What factors are driving the anomalies?",
    "How reliable is this forecast?",
    "What would happen if demand increases by 20%?",
    "When should I rerun the forecast?",
    "How do seasonal patterns affect the forecast?",
    "What are the key risk factors?",
    "How can I improve forecast accuracy?"
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0 && bestModel) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `Hello! I'm your AI Forecast Assistant. I've analyzed your ${bestModel.model} forecast results and I'm ready to help you understand the insights, trends, and implications.

**Quick Summary:**
• Best Model: ${bestModel.model} (${bestModel.metrics.mape.toFixed(2)}% MAPE)
• Trend: ${bestModel.insights.trend} (${bestModel.insights.growth_rate > 0 ? '+' : ''}${bestModel.insights.growth_rate.toFixed(1)}% growth)
• Anomalies: ${bestModel.insights.anomalies} detected
• Forecast Horizon: ${config.horizon} days

Feel free to ask me anything about your forecast results, trends, or what-if scenarios!`,
        timestamp: new Date(),
        suggestions: suggestedQuestions.slice(0, 4)
      };
      setMessages([welcomeMessage]);
    }
  }, [bestModel, config]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // Mock AI response generation - in real implementation, this would call the LLM API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('trend') || lowerMessage.includes('why')) {
      return `Based on the ${bestModel?.model} analysis, the ${bestModel?.insights.trend} trend is driven by several factors:

**Key Drivers:**
• Historical data patterns show consistent ${bestModel?.insights.seasonality} seasonality
• Growth rate of ${bestModel?.insights.growth_rate.toFixed(1)}% indicates ${bestModel?.insights.growth_rate > 0 ? 'positive momentum' : 'declining demand'}
• The model detected ${bestModel?.insights.anomalies} anomalies which may represent special events or data irregularities

**Confidence Level:** ${config.confidence_interval}% confidence interval provides reliable bounds for planning purposes.

The ${bestModel?.model} model was selected as it achieved the lowest MAPE of ${bestModel?.metrics.mape.toFixed(2)}%, making it the most accurate for your dataset.`;
    }
    
    if (lowerMessage.includes('anomal') || lowerMessage.includes('unusual')) {
      return `I've identified ${bestModel?.insights.anomalies} anomalies in your forecast data. Here's what this means:

**Anomaly Analysis:**
• Anomalies represent data points that deviate significantly from expected patterns
• They could indicate special events, promotions, supply chain disruptions, or data quality issues
• ${bestModel?.insights.anomalies} anomalies out of ${config.horizon} forecast days (${((bestModel?.insights.anomalies || 0) / config.horizon * 100).toFixed(1)}% of data)

**Recommendations:**
• Review historical data around anomaly dates for context
• Consider if these represent recurring events that should be modeled
• Monitor actual results against forecasts to validate anomaly predictions
• Use confidence intervals to account for uncertainty around anomalies`;
    }
    
    if (lowerMessage.includes('reliable') || lowerMessage.includes('accurate') || lowerMessage.includes('trust')) {
      return `Your forecast reliability assessment:

**Model Performance:**
• MAPE: ${bestModel?.metrics.mape.toFixed(2)}% (${bestModel?.metrics.mape < 10 ? 'Excellent' : bestModel?.metrics.mape < 20 ? 'Good' : 'Fair'} accuracy)
• RMSE: ${bestModel?.metrics.rmse.toFixed(2)} (measures prediction variance)
• MAE: ${bestModel?.metrics.mae.toFixed(2)} (average absolute error)

**Reliability Factors:**
• ${bestModel?.model} was chosen from ${forecastResults.length} tested algorithms
• ${config.confidence_interval}% confidence intervals provide uncertainty bounds
• ${datasets.length} dataset(s) with ${datasets.reduce((sum, d) => sum + d.rows, 0).toLocaleString()} total data points

**Trust Level:** ${bestModel?.metrics.mape < 15 ? 'High - suitable for operational decisions' : 'Medium - use with caution for strategic planning'}`;
    }
    
    if (lowerMessage.includes('what if') || lowerMessage.includes('scenario') || lowerMessage.includes('increase') || lowerMessage.includes('decrease')) {
      const changeMatch = userMessage.match(/(\d+)%/);
      const changePercent = changeMatch ? parseInt(changeMatch[1]) : 20;
      
      return `**What-If Scenario Analysis: ${changePercent}% Demand Change**

If demand ${lowerMessage.includes('increase') ? 'increases' : 'changes'} by ${changePercent}%:

**Impact Assessment:**
• Baseline forecast average: ~${bestModel?.forecast_data.slice(-30).reduce((sum, d) => sum + d.forecast, 0) / 30 || 100} units/day
• Adjusted forecast: ~${((bestModel?.forecast_data.slice(-30).reduce((sum, d) => sum + d.forecast, 0) / 30 || 100) * (1 + changePercent/100)).toFixed(0)} units/day
• Growth acceleration: ${(bestModel?.insights.growth_rate + changePercent/4).toFixed(1)}% (vs current ${bestModel?.insights.growth_rate.toFixed(1)}%)

**Business Implications:**
• Inventory planning: Adjust safety stock by ~${(changePercent * 0.8).toFixed(0)}%
• Capacity planning: May need ${changePercent > 15 ? 'significant' : 'moderate'} resource adjustments
• Risk assessment: ${changePercent > 25 ? 'High impact - requires strategic review' : 'Manageable with operational adjustments'}

Would you like me to analyze a different scenario or specific time period?`;
    }
    
    if (lowerMessage.includes('rerun') || lowerMessage.includes('update') || lowerMessage.includes('refresh')) {
      return `**Forecast Refresh Recommendations:**

**Optimal Rerun Schedule:**
• **Weekly:** For operational forecasts (7-30 days)
• **Bi-weekly:** For tactical planning (1-3 months)  
• **Monthly:** For strategic forecasts (3+ months)

**Triggers for Immediate Rerun:**
• New data available (${datasets.map(d => d.name).join(', ')})
• Significant business changes or events
• Actual results deviate >20% from forecast
• Seasonal pattern changes detected

**Current Status:**
• Last data update: ${datasets[0]?.last_updated ? new Date(datasets[0].last_updated).toLocaleDateString() : 'Unknown'}
• Forecast age: Generated today
• Model performance: ${bestModel?.metrics.mape.toFixed(1)}% MAPE

**Next Steps:** Monitor actual vs forecast performance over the next ${Math.min(7, config.horizon)} days to validate model accuracy.`;
    }
    
    if (lowerMessage.includes('seasonal') || lowerMessage.includes('pattern')) {
      return `**Seasonal Pattern Analysis:**

**Detected Patterns:**
• Primary seasonality: ${bestModel?.insights.seasonality} cycles
• Pattern strength: ${config.seasonality === 'auto' ? 'Auto-detected' : 'User-specified'} as ${config.seasonality}
• Trend component: ${bestModel?.insights.trend} with ${bestModel?.insights.growth_rate.toFixed(1)}% growth

**Seasonal Impact:**
• Peak periods: Typically show 15-25% above average demand
• Low periods: Usually 10-20% below average demand
• Transition periods: Gradual changes between peaks and troughs

**Business Applications:**
• Inventory planning: Stock up before peak seasons
• Marketing timing: Align campaigns with seasonal uptrends
• Resource allocation: Adjust staffing for seasonal variations
• Pricing strategy: Consider seasonal demand elasticity

The ${bestModel?.model} model effectively captures these patterns, contributing to its ${bestModel?.metrics.mape.toFixed(1)}% MAPE accuracy.`;
    }
    
    if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('accuracy')) {
      return `**Forecast Accuracy Improvement Strategies:**

**Data Quality (Highest Impact):**
• Add more historical data (current: ${datasets.reduce((sum, d) => sum + d.rows, 0).toLocaleString()} rows)
• Include external factors (weather, holidays, promotions)
• Clean anomalies and outliers
• Ensure data consistency and completeness

**Model Optimization:**
• Current best: ${bestModel?.model} (${bestModel?.metrics.mape.toFixed(2)}% MAPE)
• Consider ensemble methods combining multiple models
• Tune hyperparameters for your specific data patterns
• Experiment with different seasonality settings

**Feature Engineering:**
• Add leading indicators (economic data, competitor analysis)
• Include promotional and marketing spend data
• Incorporate supply chain and inventory levels
• Consider customer segmentation variables

**Monitoring & Feedback:**
• Track actual vs forecast performance weekly
• Retrain models when accuracy drops below ${bestModel?.metrics.mape.toFixed(0)}% MAPE
• Implement automated model selection
• Set up alerts for significant deviations

**Expected Improvement:** Following these steps could potentially reduce MAPE by 2-5 percentage points.`;
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". Let me help you with that based on your forecast analysis:

**Current Forecast Summary:**
• Model: ${bestModel?.model} with ${bestModel?.metrics.mape.toFixed(2)}% MAPE
• Trend: ${bestModel?.insights.trend} (${bestModel?.insights.growth_rate.toFixed(1)}% growth rate)
• Horizon: ${config.horizon} days ahead
• Confidence: ${config.confidence_interval}% intervals

**Key Insights:**
• Your data shows ${bestModel?.insights.seasonality} seasonal patterns
• ${bestModel?.insights.anomalies} anomalies detected in the forecast period
• The model suggests ${bestModel?.insights.growth_rate > 0 ? 'positive growth' : 'declining trend'} ahead

Could you be more specific about what aspect you'd like me to explain? I can help with trends, anomalies, model performance, what-if scenarios, or business implications.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(userMessage.content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        suggestions: suggestedQuestions.slice(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4) + 4)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (bestModel) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Chat cleared! I'm ready to help you understand your ${bestModel.model} forecast results. What would you like to know?`,
        timestamp: new Date(),
        suggestions: suggestedQuestions.slice(0, 4)
      };
      setMessages([welcomeMessage]);
    }
  };

  if (!bestModel) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">
          AI Chatbot Ready
        </h3>
        <p className="text-slate-500 dark:text-viz-text-secondary">
          Complete the forecasting analysis first to start chatting with the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-2">
            AI Forecast Assistant
          </h2>
          <p className="text-slate-600 dark:text-viz-text-secondary">
            Get AI-powered explanations, insights, and scenario analysis for your forecasts.
          </p>
        </div>
        <Button onClick={clearChat} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="xl:col-span-3">
          <Card className="h-[700px] flex flex-col overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6 flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-viz-accent" />
                  <span>Forecast Analysis Chat</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {messages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 px-6 py-2">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' 
                            ? 'bg-viz-accent text-white' 
                            : 'bg-slate-200 dark:bg-viz-light text-slate-600 dark:text-viz-text-secondary'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 break-words ${message.type === 'user'
                            ? 'bg-viz-accent text-white'
                            : 'bg-slate-100 dark:bg-viz-medium text-viz-dark dark:text-white'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-2 ${message.type === 'user' 
                              ? 'text-white/70' 
                              : 'text-slate-500 dark:text-viz-text-secondary'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-slate-600 dark:text-viz-text-secondary">
                                Suggested questions:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-auto py-1 px-2 break-words whitespace-normal text-left"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start w-full">
                      <div className="flex space-x-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-viz-light flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-slate-600 dark:text-viz-text-secondary" />
                        </div>
                        <div className="bg-slate-100 dark:bg-viz-medium rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-viz-accent" />
                            <span className="text-sm text-slate-600 dark:text-viz-text-secondary">
                              Analyzing your question...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {/* Input */}
              <div className="border-t border-slate-200 dark:border-viz-light p-4 flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about trends, anomalies, scenarios, or anything else..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-viz-accent hover:bg-viz-accent/90 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Quick Questions */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Lightbulb className="w-4 h-4 text-viz-accent" />
                <span>Quick Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {suggestedQuestions.slice(0, 6).map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto py-2 px-3 text-xs whitespace-normal break-words"
                  onClick={() => handleSuggestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Context Summary */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <BarChart3 className="w-4 h-4 text-viz-accent" />
                <span>Context</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">Best Model</span>
                  <Badge className="bg-viz-accent text-xs">{bestModel.model}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">MAPE</span>
                  <span className="font-medium text-viz-dark dark:text-white text-xs">
                    {bestModel.metrics.mape.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">Trend</span>
                  <div className="flex items-center space-x-1">
                    {bestModel.insights.growth_rate > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-red-500 transform rotate-180" />
                    )}
                    <span className="text-xs font-medium">
                      {bestModel.insights.growth_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">Anomalies</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium">{bestModel.insights.anomalies}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Stats */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <MessageSquare className="w-4 h-4 text-viz-accent" />
                <span>Chat Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">Messages</span>
                  <span className="font-medium text-viz-dark dark:text-white text-xs">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">Your Questions</span>
                  <span className="font-medium text-viz-dark dark:text-white text-xs">
                    {messages.filter(m => m.type === 'user').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-viz-text-secondary text-xs">AI Responses</span>
                  <span className="font-medium text-viz-dark dark:text-white text-xs">
                    {messages.filter(m => m.type === 'bot').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DUFAChatbot;
