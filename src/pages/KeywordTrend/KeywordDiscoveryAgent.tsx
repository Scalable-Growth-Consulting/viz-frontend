import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Search,
  Download,
  Copy,
  Check,
  Loader2,
  Zap,
  Target,
  Filter,
  Grid3x3,
  List,
  Lightbulb,
  ArrowRight,
  Brain,
  Layers,
  TrendingUp,
  Hash,
  Globe,
  Rocket,
  Info,
} from 'lucide-react';
import { discoverKeywords, KeywordDiscoveryError } from '@/services/keywordDiscoveryApi';

const INDUSTRIES = [
  'FinTech',
  'Healthcare',
  'E-commerce',
  'SaaS',
  'EdTech',
  'Manufacturing',
  'Automotive',
  'Energy',
  'Aerospace',
  'Telecommunications',
  'Consumer Electronics',
  'Biotech',
  'Logistics',
  'Retail',
  'Real Estate',
  'Travel & Hospitality',
  'Gaming',
  'Food & Beverage',
];

// Shared context for cross-agent communication
export interface KeywordDiscoveryContext {
  industry: string;
  keywords: string[];
  selectedKeywords: Set<string>;
}

interface KeywordDiscoveryAgentProps {
  onKeywordsDiscovered?: (context: KeywordDiscoveryContext) => void;
  initialIndustry?: string;
}

const KeywordDiscoveryAgent: React.FC<KeywordDiscoveryAgentProps> = ({
  onKeywordsDiscovered,
  initialIndustry = '',
}) => {
  const { toast } = useToast();

  // Form state
  const [industry, setIndustry] = useState(initialIndustry);
  const [usp, setUsp] = useState('');
  const [keyServices, setKeyServices] = useState('');

  // Discovery state
  const [discovering, setDiscovering] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    if (!searchQuery.trim()) return keywords;
    const query = searchQuery.toLowerCase();
    return keywords.filter((kw) => kw.toLowerCase().includes(query));
  }, [keywords, searchQuery]);

  // Keyword categories (smart grouping with insights and intelligent fallback)
  const keywordCategories = useMemo(() => {
    if (keywords.length === 0) return [];
    
    const categories: { 
      name: string; 
      keywords: string[]; 
      icon: React.ReactNode;
      color: string;
      description: string;
      insight: string;
      metrics: { label: string; value: string }[];
    }[] = [];
    
    // Group by common patterns
    let longTail = keywords.filter(kw => kw.split(' ').length >= 3);
    let shortTail = keywords.filter(kw => kw.split(' ').length < 3);
    const questions = keywords.filter(kw => 
      kw.toLowerCase().startsWith('how') || 
      kw.toLowerCase().startsWith('what') || 
      kw.toLowerCase().startsWith('why') ||
      kw.toLowerCase().startsWith('when') ||
      kw.includes('?')
    );
    
    // Smart fallback: If no core keywords exist, extract the shortest/most impactful from long-tail
    if (shortTail.length === 0 && longTail.length > 0) {
      // Sort by word count and take the shortest ones (closest to core keywords)
      const sortedByLength = [...longTail].sort((a, b) => a.split(' ').length - b.split(' ').length);
      
      // Take up to 20% of keywords or minimum 5, whichever is larger
      const coreCount = Math.max(5, Math.ceil(longTail.length * 0.2));
      shortTail = sortedByLength.slice(0, coreCount);
      
      // Remove these from long-tail to avoid duplication
      const shortTailSet = new Set(shortTail);
      longTail = longTail.filter(kw => !shortTailSet.has(kw));
    }
    
    // Always show Long-tail first (if exists)
    if (longTail.length > 0) {
      categories.push({ 
        name: 'Long-tail Keywords', 
        keywords: longTail,
        icon: <Layers className="w-5 h-5" />,
        color: 'from-blue-500 to-cyan-600',
        description: '3+ word phrases with specific intent',
        insight: 'Lower competition, higher conversion rates. These keywords target users who know exactly what they want.',
        metrics: [
          { label: 'Count', value: longTail.length.toString() },
          { label: 'Avg Length', value: `${Math.round(longTail.reduce((sum, kw) => sum + kw.split(' ').length, 0) / longTail.length)} words` },
          { label: 'Competition', value: 'Low-Medium' }
        ]
      });
    }
    
    // Always show Core keywords (with fallback logic)
    if (shortTail.length > 0) {
      const avgLength = Math.round(shortTail.reduce((sum, kw) => sum + kw.split(' ').length, 0) / shortTail.length);
      const isFallback = avgLength >= 3; // Detect if we used fallback logic
      
      categories.push({ 
        name: 'Core Keywords', 
        keywords: shortTail,
        icon: <Target className="w-5 h-5" />,
        color: 'from-purple-500 to-pink-600',
        description: isFallback ? 'Priority high-impact terms' : '1-2 word broad terms',
        insight: isFallback 
          ? 'Selected as priority keywords based on brevity and impact. These represent your most focused search terms.'
          : 'High search volume, high competition. Essential for brand visibility and capturing broad market interest.',
        metrics: [
          { label: 'Count', value: shortTail.length.toString() },
          { label: 'Avg Length', value: `${avgLength} words` },
          { label: 'Competition', value: isFallback ? 'Medium' : 'High' }
        ]
      });
    }
    
    // Show Question keywords if they exist
    if (questions.length > 0) {
      categories.push({ 
        name: 'Question Keywords', 
        keywords: questions,
        icon: <Brain className="w-5 h-5" />,
        color: 'from-emerald-500 to-teal-600',
        description: 'Query-based search intent',
        insight: 'Perfect for content marketing and featured snippets. Users are seeking answers and solutions.',
        metrics: [
          { label: 'Count', value: questions.length.toString() },
          { label: 'Intent', value: 'Informational' },
          { label: 'Content Fit', value: 'Blog/FAQ' }
        ]
      });
    }
    
    return categories;
  }, [keywords]);

  const handleDiscoverKeywords = async () => {
    if (!industry || !usp.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select an industry and enter your USP.',
        variant: 'destructive',
      });
      return;
    }

    setDiscovering(true);
    setKeywords([]);
    setTotalCount(0);
    setSelectedKeywords(new Set());

    try {
      const keyServicesArray = keyServices
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await discoverKeywords({
        industry,
        usp,
        key_services: keyServicesArray,
      });

      setKeywords(result.unified_keywords);
      setTotalCount(result.total_count);

      // Notify parent component
      onKeywordsDiscovered?.({
        industry,
        keywords: result.unified_keywords,
        selectedKeywords: new Set(),
      });

      toast({
        title: 'Keywords Discovered!',
        description: `Found ${result.total_count} relevant keywords for your business.`,
      });
    } catch (error) {
      console.error('Keyword discovery failed:', error);

      const errorMessage =
        error instanceof KeywordDiscoveryError
          ? error.message
          : 'Failed to discover keywords. Please try again.';

      toast({
        title: 'Discovery Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDiscovering(false);
    }
  };

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleCopyAll = () => {
    const text = filteredKeywords.join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${filteredKeywords.length} keywords copied to clipboard.`,
    });
  };

  const handleCopySelected = () => {
    const text = Array.from(selectedKeywords).join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${selectedKeywords.size} selected keywords copied to clipboard.`,
    });
  };

  const handleDownloadCSV = () => {
    const csv = filteredKeywords.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${industry}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleKeywordSelection = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);

    // Notify parent of selection change
    onKeywordsDiscovered?.({
      industry,
      keywords,
      selectedKeywords: newSelected,
    });
  };

  const selectAll = () => {
    const newSelected = new Set(filteredKeywords);
    setSelectedKeywords(newSelected);
    onKeywordsDiscovered?.({
      industry,
      keywords,
      selectedKeywords: newSelected,
    });
  };

  const clearSelection = () => {
    setSelectedKeywords(new Set());
    onKeywordsDiscovered?.({
      industry,
      keywords,
      selectedKeywords: new Set(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold shadow-sm">
            <Target className="w-4 h-4" />
            Keyword Discovery Agent
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight py-2">
            Discover High-Impact Keywords
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI-powered keyword discovery that uncovers the most relevant, high-converting keywords for your business in seconds.
          </p>
        </motion.div>

        {/* Main Content - Full Width Layout */}
        <div className="space-y-4">
          {/* Configuration Form - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Industry Selection */}
                  <div>
                    <Label htmlFor="industry" className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      Industry *
                    </Label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all text-sm"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Key Services */}
                  <div>
                    <Label htmlFor="keyServices" className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      Key Services
                    </Label>
                    <Input
                      id="keyServices"
                      placeholder="AI consulting, cloud migration"
                      value={keyServices}
                      onChange={(e) => setKeyServices(e.target.value)}
                      className="h-9 text-sm rounded-lg border-2"
                    />
                  </div>

                  {/* USP */}
                  <div className="md:col-span-2">
                    <Label htmlFor="usp" className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5 text-pink-500" />
                      Unique Selling Proposition *
                    </Label>
                    <Textarea
                      id="usp"
                      placeholder="Describe what makes your business unique..."
                      value={usp}
                      onChange={(e) => setUsp(e.target.value)}
                      rows={2}
                      className="text-sm resize-none rounded-lg border-2"
                    />
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleDiscoverKeywords}
                    disabled={discovering}
                    className="md:col-span-4 h-10 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all rounded-lg"
                  >
                    {discovering ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Discovering...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Discover Keywords
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid - Full Width Below Form (Only when keywords exist) */}
          <AnimatePresence mode="wait">
            {keywords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="grid grid-cols-4 gap-3"
              >
                    <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{totalCount}</p>
                            <p className="text-xs text-indigo-100">Total Keywords</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Filter className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{filteredKeywords.length}</p>
                            <p className="text-xs text-purple-100">Filtered</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{selectedKeywords.size}</p>
                            <p className="text-xs text-pink-100">Selected</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{industry || '—'}</p>
                            <p className="text-xs text-emerald-100">Industry</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keyword Intelligence Dashboard - Full Width Below Stats */}
          <AnimatePresence mode="wait">
            {keywords.length > 0 && keywordCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {keywordCategories.length > 0 && (
                    <div className="space-y-4">
                      {/* Educational Header - More Compact */}
                      <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                              <Lightbulb className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Keyword Intelligence Breakdown
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                Categorized by search intent and competition level for strategic targeting
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Primary Category Cards - 2 Column Layout */}
                      <div className="grid lg:grid-cols-2 gap-4">
                        {keywordCategories.filter(cat => cat.name !== 'Question Keywords').map((category, idx) => (
                          <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
                              {/* Gradient Header - More Compact */}
                              <div className={`bg-gradient-to-r ${category.color} p-4 text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                      {category.icon}
                                    </div>
                                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs font-semibold">
                                      {category.keywords.length} keywords
                                    </Badge>
                                  </div>
                                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                                  <p className="text-xs text-white/90">{category.description}</p>
                                </div>
                              </div>

                              <CardContent className="p-4 space-y-3">
                                {/* Insight Box - Compact */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                  <div className="flex items-start gap-2 mb-1.5">
                                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                      Why This Matters
                                    </p>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {category.insight}
                                  </p>
                                </div>

                                {/* Metrics Grid - Compact */}
                                <div className="grid grid-cols-3 gap-2">
                                  {category.metrics.map((metric) => (
                                    <div key={metric.label} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                      <p className="text-base font-bold text-slate-900 dark:text-white">
                                        {metric.value}
                                      </p>
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">
                                        {metric.label}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Sample Keywords */}
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Sample Keywords
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {category.keywords.slice(0, 5).map((kw) => (
                                      <Badge
                                        key={kw}
                                        variant="secondary"
                                        className="text-[10px] cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all hover:scale-105"
                                        onClick={() => toggleKeywordSelection(kw)}
                                      >
                                        {kw}
                                      </Badge>
                                    ))}
                                    {category.keywords.length > 5 && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-[10px] font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                        +{category.keywords.length - 5}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Select All Button - Compact */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-8 text-xs rounded-lg group-hover:bg-slate-50 dark:group-hover:bg-slate-900"
                                  onClick={() => {
                                    // Select all keywords from this category
                                    const newSelected = new Set(selectedKeywords);
                                    category.keywords.forEach(kw => newSelected.add(kw));
                                    setSelectedKeywords(newSelected);
                                  }}
                                >
                                  <Check className="w-3.5 h-3.5 mr-1.5" />
                                  Select All
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* Controls & Search - Full Width */}
                  <Card className="border-2 shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            placeholder="Search keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 text-base rounded-xl border-2"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="rounded-lg"
                          >
                            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={selectAll} className="rounded-lg">
                            Select All
                          </Button>
                          {selectedKeywords.size > 0 && (
                            <>
                              <Button variant="outline" size="sm" onClick={clearSelection} className="rounded-lg">
                                Clear
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCopySelected} className="rounded-lg">
                                <Copy className="w-4 h-4 mr-1" />
                                Copy Selected
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" onClick={handleCopyAll} className="rounded-lg">
                            <Copy className="w-4 h-4 mr-1" />
                            Copy All
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="rounded-lg">
                            <Download className="w-4 h-4 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategy Recommendation - Compact Banner */}
                  <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                            Pro Strategy
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-amber-600 flex-shrink-0" />
                              <strong>Long-tail</strong> for quick wins
                            </span>
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-amber-600 flex-shrink-0" />
                              <strong>Core</strong> for authority
                            </span>
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-amber-600 flex-shrink-0" />
                              <strong>Questions</strong> for snippets
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords Display */}
                  <Card className="border-2 shadow-lg">
                    <CardContent className="p-6">
                      {filteredKeywords.length === 0 ? (
                        <div className="text-center py-12">
                          <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                          <p className="text-slate-500 dark:text-slate-400">No keywords match your search</p>
                        </div>
                      ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {filteredKeywords.map((keyword, index) => (
                            <motion.div
                              key={keyword}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: Math.min(index * 0.01, 0.5) }}
                              className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                selectedKeywords.has(keyword)
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-md'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900 hover:shadow-md'
                              }`}
                              onClick={() => toggleKeywordSelection(keyword)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">
                                  {keyword}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyKeyword(keyword);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                  {copiedKeyword === keyword ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              </div>
                              {selectedKeywords.has(keyword) && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredKeywords.map((keyword, index) => (
                            <motion.div
                              key={keyword}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(index * 0.01, 0.5) }}
                              className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                selectedKeywords.has(keyword)
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                              }`}
                              onClick={() => toggleKeywordSelection(keyword)}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    selectedKeywords.has(keyword)
                                      ? 'bg-indigo-500 border-indigo-500'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {selectedKeywords.has(keyword) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{keyword}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyKeyword(keyword);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                              >
                                {copiedKeyword === keyword ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* CTA to Trend Agent */}
                  {selectedKeywords.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                  Ready for Trend Analysis?
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {selectedKeywords.size} keyword{selectedKeywords.size !== 1 ? 's' : ''} selected — analyze market trends now
                                </p>
                              </div>
                            </div>
                            <Button
                              size="lg"
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md"
                            >
                              <TrendingUp className="w-5 h-5 mr-2" />
                              Open Trend Agent
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          {/* Empty State - Full Width */}
          {keywords.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center space-y-6 max-w-md">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-lg">
                  <Lightbulb className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Ready to Discover Keywords?
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Fill in your industry and USP to generate a comprehensive list of high-impact keywords tailored to your business.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
                  <Badge variant="secondary" className="text-xs">Industry-Specific</Badge>
                  <Badge variant="secondary" className="text-xs">High-Converting</Badge>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordDiscoveryAgent;
