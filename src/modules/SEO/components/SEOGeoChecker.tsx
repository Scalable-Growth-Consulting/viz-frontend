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

  const handleSaveImage = async () => {
    if (!containerRef.current) return;
    toast({ title: 'Capturing Image...', description: 'Creating your visual report' });
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all text is rendered properly
          const textElements = clonedDoc.querySelectorAll('*');
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            if (computedStyle.webkitBackgroundClip === 'text') {
              htmlEl.style.webkitBackgroundClip = 'unset';
              htmlEl.style.backgroundClip = 'unset';
              htmlEl.style.color = computedStyle.color || '#1f2937';
            }
          });
        }
      });
      
      const link = document.createElement('a');
      link.download = 'master-seo-geo-report.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast({ title: "Image saved successfully!" });
    } catch (error) {
      console.error('Error saving image:', error);
      toast({ title: "Error saving image", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    toast({ title: 'Generating PDF...', description: 'Creating your AI-powered report' });
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all text is rendered properly
          const textElements = clonedDoc.querySelectorAll('*');
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            if (computedStyle.webkitBackgroundClip === 'text') {
              htmlEl.style.webkitBackgroundClip = 'unset';
              htmlEl.style.backgroundClip = 'unset';
              htmlEl.style.color = computedStyle.color || '#1f2937';
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('master-seo-geo-report.pdf');
      toast({ title: "PDF exported successfully!" });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({ title: "Error exporting PDF", variant: "destructive" });
    }
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
    <div className="w-full max-w-none space-y-6 sm:space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6 sm:mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-violet-200/20 dark:border-purple-400/20 rounded-2xl p-1">
            <TabsTrigger 
              value="input" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
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
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none" />
              <CardHeader className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-2 sm:p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg"
                  >
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Launch Analysis
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Unleash the power of Master SEO and GEO
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-violet-500" />
                        Website URL
                      </label>
                      <Input 
                        placeholder="https://your-awesome-site.com" 
                        value={input.url || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, url: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-violet-200/50 dark:border-purple-400/30 rounded-xl focus:border-violet-400 dark:focus:border-purple-400 transition-all duration-300"
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
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-indigo-400/30 rounded-xl focus:border-purple-400 dark:focus:border-indigo-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Primary Keyword
                      </label>
                      <Input 
                        placeholder="e.g., AI-powered marketing tools" 
                        value={input.primaryKeyword || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, primaryKeyword: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-indigo-200/50 dark:border-violet-400/30 rounded-xl focus:border-indigo-400 dark:focus:border-violet-400 transition-all duration-300"
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
                        <Brain className="w-4 h-4 text-purple-500" />
                        Raw HTML (optional)
                      </label>
                      <Textarea 
                        rows={6} 
                        placeholder="Paste your page's HTML for maximum AI precision..." 
                        value={input.rawHtml || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, rawHtml: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-indigo-400/30 rounded-xl focus:border-purple-400 dark:focus:border-indigo-400 transition-all duration-300 resize-none"
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
                      <Users className="w-4 h-4 text-indigo-500" />
                      Competitor Analysis
                    </label>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 rounded-full px-3 py-1">
                      Up to 3 rivals
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-indigo-200/50 dark:border-violet-400/30 rounded-xl focus:border-indigo-400 dark:focus:border-violet-400 transition-all duration-300"
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={()=> setInput({ competitors: [] })}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex-shrink-0"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 sm:flex-initial"
                  >
                    <Button 
                      disabled={!canAnalyze || loading} 
                      onClick={handleAnalyze} 
                      className="w-full sm:w-auto bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-700 text-white border-0 rounded-xl px-6 sm:px-8 py-3 font-bold text-base sm:text-lg shadow-2xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Launch Analysis
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                <Alert className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200/50 dark:border-purple-400/30 rounded-xl">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <AlertDescription className="text-sm text-violet-700 dark:text-violet-300">
                    <strong>Pro Tip:</strong> For maximum AI precision, paste raw HTML from your CMS or crawler.
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
            <div ref={containerRef} className="space-y-4 sm:space-y-6 p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold">SEO & GEO Scorecard</h2>
                  <p className="text-xs text-muted-foreground break-all sm:break-normal">{result.url || 'HTML input'} • Computed {new Date(result.computedAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveImage} className="gap-2 w-full sm:w-auto">
                    <ImageIcon className="w-4 h-4" /> Save Image
                  </Button>
                  <Button size="sm" onClick={handleExportPDF} className="gap-2 w-full sm:w-auto">
                    <FileDown className="w-4 h-4" /> Export PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="col-span-1 bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold">Overall Score</CardTitle>
                    <CardDescription className="text-xs">0 – 100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-4xl font-extrabold text-slate-800 dark:text-white drop-shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-full w-20 h-20 flex items-center justify-center backdrop-blur-sm border-2 border-violet-200 dark:border-violet-400">{result.overallScore}</div>
                      </div>
                      <ModernScoreDial score={result.overallScore} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-2 bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Pillars</CardTitle>
                    <CardDescription className="text-xs">Visibility • Trust • Relevance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <GlassPill label="Visibility" value={result.pillars.visibility} color="from-violet-400 to-violet-600" icon={<Eye className="w-4 h-4 text-white" />} />
                      <GlassPill label="Trust" value={result.pillars.trust} color="from-purple-400 to-purple-600" icon={<Star className="w-4 h-4 text-white" />} />
                      <GlassPill label="Relevance" value={result.pillars.relevance} color="from-indigo-400 to-indigo-600" icon={<Target className="w-4 h-4 text-white" />} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-viz-medium/90 dark:to-viz-dark/90 border border-violet-200/50 dark:border-violet-400/30 shadow-xl backdrop-blur-sm h-full flex flex-col">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            On-Page SEO Analysis
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            Technical optimization metrics
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                          <div className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Title Length</div>
                          <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{result.onPage.titleLength}</div>
                          <div className="text-xs text-violet-500 dark:text-violet-400">characters</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-400/30">
                          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Meta Description</div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{result.onPage.metaDescriptionLength}</div>
                          <div className="text-xs text-purple-500 dark:text-purple-400">characters</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-400/30">
                          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{result.onPage.h1Count}</div>
                          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">H1</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{result.onPage.h2Count}</div>
                          <div className="text-xs text-violet-700 dark:text-violet-300 font-medium">H2</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-400/30">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{result.onPage.h3Count}</div>
                          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">H3</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-400/30">
                          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Word Count</div>
                          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{result.onPage.wordCount}</div>
                          <div className="text-xs text-emerald-500 dark:text-emerald-400">words</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30">
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Images</div>
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{result.onPage.imageCount}</div>
                          <div className="text-xs text-blue-500 dark:text-blue-400">{result.onPage.imageCount ? Math.round(100*result.onPage.imagesWithAlt/result.onPage.imageCount) : 100}% alt coverage</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${result.onPage.schemaPresent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">Schema Markup</span>
                        </div>
                        <span className="text-sm font-semibold">{result.onPage.schemaPresent ? 'Present' : 'Missing'}</span>
                      </div>

                      {result.onPage.pageSpeed && (
                        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200/50 dark:border-orange-400/30">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{result.onPage.pageSpeed.performance}</div>
                            <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Performance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{result.onPage.pageSpeed.lcp?.toFixed ? result.onPage.pageSpeed.lcp.toFixed(2) : result.onPage.pageSpeed.lcp}</div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">LCP</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{result.onPage.pageSpeed.cls}</div>
                            <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">CLS</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-white/95 to-violet-50/95 dark:from-viz-medium/90 dark:to-violet-900/20 border border-violet-200/50 dark:border-violet-400/30 shadow-xl backdrop-blur-sm h-full flex flex-col">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Generative AI Engine Optimization
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            AI visibility, citations & brand authority
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-violet-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-violet-50/90 to-purple-50/90 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl border border-violet-200/50 dark:border-violet-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{result.geo.aiVisibilityRate}</div>
                            </div>
                            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-1">AI Visibility Rate</div>
                            <div className="text-xs text-violet-600 dark:text-violet-400">Content structure optimization</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl border border-purple-200/50 dark:border-purple-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Star className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{result.geo.citationFrequency}</div>
                            </div>
                            <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Citation Frequency</div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Factual data & statistics</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl border border-indigo-200/50 dark:border-indigo-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                                <Target className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{result.geo.brandMentionScore}</div>
                            </div>
                            <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Brand Mention Score</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400">Authority & credibility signals</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.geo.sentimentAccuracy}</div>
                            </div>
                            <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Sentiment Accuracy</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">Positive messaging analysis</div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Advanced AI Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">{result.geo.structuredDataScore}</div>
                            <div className="text-xs text-violet-700 dark:text-violet-300 font-medium">Structured Data</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-indigo-400/30">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{result.geo.contextualRelevance}</div>
                            <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Contextual Relevance</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200/50 dark:border-violet-400/30">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{result.geo.authoritySignals}</div>
                            <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Authority Signals</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-400/30">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{result.geo.conversationalOptimization}</div>
                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Conversational AI</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{result.geo.factualAccuracy}</div>
                            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Factual Accuracy</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-400/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{result.geo.topicCoverage}</div>
                            <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Topic Coverage</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="mt-8">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-white/95 to-emerald-50/95 dark:from-viz-medium/90 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-400/30 shadow-xl backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Priority Quick Wins
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            High-impact optimizations to implement first
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(result.topQuickFixes || []).map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * i }}
                          className="group p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-400/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {i + 1}
                            </div>
                            <div className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{f}</div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-white/95 to-blue-50/95 dark:from-viz-medium/90 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-400/30 shadow-xl backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Growth Opportunities
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            Strategic improvements for long-term success
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(result.missedOpportunities || []).map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * i }}
                          className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {i + 1}
                            </div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{m}</div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
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
