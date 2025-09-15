import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSEOGeo } from '../services/seoAnalyzer';
import type { AnalysisInput, AnalysisResult } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, FileDown, Image as ImageIcon, Loader2, RefreshCcw, Sparkles, Globe2, Target, Users, Brain, Zap, Rocket, TrendingUp, Eye, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, Legend, LineChart, Line, Area, AreaChart } from 'recharts';

const GlassPill = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -2 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 shadow-lg"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{value}</div>
    </div>
  </motion.div>
);

function ModernScoreDial({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: 'url(#modernGrad)' }];
  const bg = [{ name: 'bg', value: 100, fill: 'rgba(148,163,184,0.1)' }];
  
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart innerRadius="60%" outerRadius="90%" data={bg} startAngle={90} endAngle={-270}>
          <RadialBar minPointSize={15} dataKey="value" cornerRadius={12} background />
          <RadialBar dataKey="value" data={data} cornerRadius={12} />
          <defs>
            <linearGradient id="modernGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            AI Score
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

export const SEOGeoChecker: React.FC = () => {
  const [input, setInput] = useState<AnalysisInput>({ competitors: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const canAnalyze = useMemo(() => {
    return Boolean((input.url && input.url.trim().length > 0) || (input.rawHtml && input.rawHtml.trim().length > 0));
  }, [input.url, input.rawHtml]);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const res = await analyzeSEOGeo(input);
      setResult(res);
      setActiveTab('report');
    } catch (e: any) {
      toast({ title: 'Analysis failed', description: e?.message || 'Unable to analyze the page', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    toast({ title: 'Generating PDF...', description: 'Creating your AI-powered report' });
    
    const canvas = await html2canvas(containerRef.current, { 
      scale: 3, 
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: containerRef.current.scrollWidth,
      height: containerRef.current.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // Add margins
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    let heightLeft = imgHeight;
    let position = 10; // Top margin

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('seo-gai-engine-report.pdf');
    toast({ title: 'PDF Ready! 🚀', description: 'Your Generative AI Engine report has been downloaded' });
  };

  const handleSaveImage = async () => {
    if (!containerRef.current) return;
    toast({ title: 'Capturing Image...', description: 'Creating your visual report' });
    
    const canvas = await html2canvas(containerRef.current, { 
      scale: 3, 
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: containerRef.current.scrollWidth,
      height: containerRef.current.scrollHeight
    });
    
    const link = document.createElement('a');
    link.download = 'seo-gai-engine-report.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    toast({ title: 'Image Ready! ✨', description: 'Your visual report has been downloaded' });
  };

  const recommendedTitle = useMemo(() => {
    if (!result) return '';
    const pk = (input.primaryKeyword || '').trim();
    const base = result.onPage.title || '';
    const brand = new URL(result.url || window.location.href).hostname.replace('www.', '');
    if (pk) return `${pk} | ${brand}`.slice(0, 64);
    if (base) return `${base} | ${brand}`.slice(0, 64);
    return `Your ${brand} | Official Site`.slice(0, 64);
  }, [result, input.primaryKeyword]);

  const recommendedDescription = useMemo(() => {
    if (!result) return '';
    const pk = (input.primaryKeyword || '').trim();
    const benefits = ['fast', 'reliable', 'trusted', 'affordable', 'award-winning'];
    const msg = pk
      ? `Discover ${pk} — ${benefits[0]} and ${benefits[1]}. Get started today.`
      : `Discover what makes us ${benefits[0]} and ${benefits[1]}. Get started today.`;
    return msg.slice(0, 155);
  }, [result, input.primaryKeyword]);

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-sm border border-pink-200/20 dark:border-purple-400/20 rounded-2xl p-1">
            <TabsTrigger 
              value="input" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="input">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg"
                  >
                    <Rocket className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Launch Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Unleash the power of Generative AI Engine Optimization
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-pink-500" />
                        Website URL
                      </label>
                      <Input 
                        placeholder="https://your-awesome-site.com" 
                        value={input.url || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, url: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-pink-200/50 dark:border-purple-400/30 rounded-xl focus:border-pink-400 dark:focus:border-purple-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        Target Market
                      </label>
                      <Input 
                        placeholder="e.g., San Francisco, CA" 
                        value={input.targetMarket || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, targetMarket: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-cyan-400/30 rounded-xl focus:border-purple-400 dark:focus:border-cyan-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                        Primary Keyword
                      </label>
                      <Input 
                        placeholder="e.g., AI-powered marketing tools" 
                        value={input.primaryKeyword || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, primaryKeyword: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-cyan-200/50 dark:border-pink-400/30 rounded-xl focus:border-cyan-400 dark:focus:border-pink-400 transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-orange-500" />
                        Raw HTML (optional)
                      </label>
                      <Textarea 
                        rows={6} 
                        placeholder="Paste your page's HTML for maximum AI precision..." 
                        value={input.rawHtml || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, rawHtml: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-orange-200/50 dark:border-yellow-400/30 rounded-xl focus:border-orange-400 dark:focus:border-yellow-400 transition-all duration-300 resize-none"
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-500" />
                      Competitor Analysis
                    </label>
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 rounded-full px-3 py-1">
                      Up to 3 rivals
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0,1,2].map((idx)=> (
                      <Input 
                        key={idx} 
                        placeholder={`https://competitor-${idx+1}.com`} 
                        value={(input.competitors?.[idx] || '')} 
                        onChange={(e)=> {
                          const list = [...(input.competitors||[])];
                          list[idx] = e.target.value;
                          setInput((s)=> ({ ...s, competitors: list }));
                        }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-red-200/50 dark:border-red-400/30 rounded-xl focus:border-red-400 dark:focus:border-red-400 transition-all duration-300"
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center justify-between pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={()=> setInput({ competitors: [] })}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      disabled={!canAnalyze || loading} 
                      onClick={handleAnalyze} 
                      className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-600 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-700 text-white border-0 rounded-xl px-8 py-3 font-bold text-lg shadow-2xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Launch Analysis
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200/50 dark:border-cyan-400/30 rounded-xl">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> For maximum AI precision, paste raw HTML from your CMS or crawler. We never store your data.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="report">
          {!result ? (
            <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">No report yet. Run an analysis from the Input tab.</CardContent>
            </Card>
          ) : (
            <div ref={containerRef} className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">SEO & GEO Scorecard</h2>
                  <p className="text-xs text-muted-foreground">{result.url || 'HTML input'} • Computed {new Date(result.computedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveImage} className="gap-2"><ImageIcon className="w-4 h-4" /> Save Image</Button>
                  <Button size="sm" onClick={handleExportPDF} className="gap-2"><FileDown className="w-4 h-4" /> Export PDF</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold">Overall Score</CardTitle>
                    <CardDescription className="text-xs">0 – 100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-3xl font-extrabold">{result.overallScore}</div>
                      </div>
                      <ModernScoreDial score={result.overallScore} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Pillars</CardTitle>
                    <CardDescription className="text-xs">Visibility • Trust • Relevance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <GlassPill label="Visibility" value={result.pillars.visibility} color="from-cyan-400 to-cyan-600" icon={<Eye className="w-4 h-4 text-white" />} />
                      <GlassPill label="Trust" value={result.pillars.trust} color="from-emerald-400 to-emerald-600" icon={<Star className="w-4 h-4 text-white" />} />
                      <GlassPill label="Relevance" value={result.pillars.relevance} color="from-indigo-400 to-indigo-600" icon={<Target className="w-4 h-4 text-white" />} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader>
                    <SectionHeader title="On-Page SEO" description="Title, meta, headings, content, alt text, schema, links" icon={<Target className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Title len</span><div className="font-semibold">{result.onPage.titleLength}</div></div>
                    <div><span className="text-muted-foreground">Meta len</span><div className="font-semibold">{result.onPage.metaDescriptionLength}</div></div>
                    <div><span className="text-muted-foreground">H1/H2/H3</span><div className="font-semibold">{result.onPage.h1Count}/{result.onPage.h2Count}/{result.onPage.h3Count}</div></div>
                    <div><span className="text-muted-foreground">Words</span><div className="font-semibold">{result.onPage.wordCount}</div></div>
                    <div><span className="text-muted-foreground">Images</span><div className="font-semibold">{result.onPage.imageCount}</div></div>
                    <div><span className="text-muted-foreground">Alt coverage</span><div className="font-semibold">{result.onPage.imageCount ? Math.round(100*result.onPage.imagesWithAlt/result.onPage.imageCount) : 100}%</div></div>
                    <div><span className="text-muted-foreground">Schema</span><div className="font-semibold">{result.onPage.schemaPresent ? 'Yes' : 'No'}</div></div>
                    <div><span className="text-muted-foreground">Internal/External</span><div className="font-semibold">{result.onPage.internalLinks}/{result.onPage.externalLinks}</div></div>
                    {result.onPage.pageSpeed && (
                      <div className="col-span-2 grid grid-cols-3 gap-3">
                        <div><span className="text-muted-foreground">Perf</span><div className="font-semibold">{result.onPage.pageSpeed.performance}</div></div>
                        <div><span className="text-muted-foreground">LCP</span><div className="font-semibold">{result.onPage.pageSpeed.lcp?.toFixed ? result.onPage.pageSpeed.lcp.toFixed(2) : result.onPage.pageSpeed.lcp}</div></div>
                        <div><span className="text-muted-foreground">CLS</span><div className="font-semibold">{result.onPage.pageSpeed.cls}</div></div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader>
                    <SectionHeader title="GEO Signals" description="Language, hreflang, local terms, NAP" icon={<Globe2 className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-muted-foreground">Language</span><div className="font-semibold">{result.geo.language || '—'}</div></div>
                      <div><span className="text-muted-foreground">Hreflang tags</span><div className="font-semibold">{result.geo.hreflangTags?.length || 0}</div></div>
                      <div><span className="text-muted-foreground">Local terms</span><div className="font-semibold">{result.geo.localKeywords?.join(', ') || '—'}</div></div>
                      <div><span className="text-muted-foreground">NAP</span><div className="font-semibold">{result.geo.nap?.phone || '—'}</div></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader>
                    <SectionHeader title="Competitors" description="Keyword overlap estimate" icon={<Users className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    {result.offPage.competitorKeywordOverlap?.length ? (
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.offPage.competitorKeywordOverlap}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="competitor" hide tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="overlap" fill="#60a5fa" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No competitor data.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader>
                    <SectionHeader title="Top Quick Wins" description="Fix these first for maximum impact" icon={<Sparkles className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                    {(result.topQuickFixes || []).map((f, i)=> (
                      <div key={i} className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 p-3">• {f}</div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader>
                    <SectionHeader title="Missed Opportunities" description="Ideas to expand" icon={<RefreshCcw className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(result.missedOpportunities || []).map((m, i)=> (
                      <div key={i} className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 p-3">• {m}</div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader>
                  <SectionHeader title="AI: Rewrite Meta Tags" description="Instant suggestions based on your primary keyword (no API key required)" icon={<Sparkles className="w-4 h-4" />} />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Recommended Title (≤ 65 chars)</label>
                    <Input value={recommendedTitle} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Recommended Meta Description (≤ 155 chars)</label>
                    <Textarea value={recommendedDescription} readOnly className="mt-1" rows={3} />
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-[11px] text-muted-foreground">
                Generated by <span className="font-semibold">MIA</span>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {!result ? (
            <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">Run an analysis first to ask AI about the report.</CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle>Ask AI About This Report</CardTitle>
                <CardDescription>Freemium gating placeholder — can require signup/upgrade later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Alert>
                  <AlertDescription className="text-xs">This MVP does not call any external AI API by default. We can wire this to your backend or OpenAI later.</AlertDescription>
                </Alert>
                <p>Suggested prompts:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>"Give me a prioritized SEO action plan for this page by effort vs. impact"</li>
                  <li>"Generate 5 blog topics to rank for our primary keyword and city"</li>
                  <li>"What schema types should we add and why?"</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
