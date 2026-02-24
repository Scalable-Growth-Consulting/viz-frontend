import React, { useState } from 'react';
import { Search, Download, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEOScoreCards } from './SEOScoreCards';
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';

interface SEODashboardProps {
  activeView: string;
}

export const SEODashboard: React.FC<SEODashboardProps> = ({ activeView }) => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleAnalyze = () => {
    if (!url) return;
    setAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setAnalyzing(false);
      setHasResults(true);
    }, 2000);
  };

  const handleExport = () => {
    console.log('Exporting report...');
  };

  const handleShare = () => {
    console.log('Sharing report...');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-viz-dark border-b border-slate-200 dark:border-viz-light/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to analyze (e.g., https://example.com)"
                className="pl-10 h-11"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!url || analyzing}
              className="h-11 px-6"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          
          {hasResults && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          {!hasResults ? (
            <div className="flex items-center justify-center h-[calc(100vh-300px)]">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-viz-accent to-blue-600 rounded-2xl flex items-center justify-center">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Ready to Analyze
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Enter a URL above to get comprehensive SEO and GEO insights with actionable recommendations.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Cards */}
              <SEOScoreCards
                seoScore={85}
                geoScore={78}
                performanceScore={92}
                loading={analyzing}
              />

              {/* Tabbed Content Based on Active View */}
              {activeView === 'overview' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SEOGeoChecker />
                  </CardContent>
                </Card>
              )}

              {activeView === 'technical' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technical SEO Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">✓ Passed Checks (12)</h4>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <li>• Mobile-friendly design</li>
                            <li>• HTTPS enabled</li>
                            <li>• Valid robots.txt</li>
                            <li>• Sitemap present</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">⚠ Warnings (3)</h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                            <li>• Slow server response time</li>
                            <li>• Missing alt tags on images</li>
                            <li>• Large page size</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === 'content' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Content Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Word Count</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">1,247</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Readability</div>
                          <div className="text-2xl font-bold text-green-600">Good</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Keyword Density</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">2.3%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === 'backlinks' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Backlink Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Backlinks</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">1,234</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Referring Domains</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">456</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Domain Authority</div>
                          <div className="text-2xl font-bold text-green-600">72</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Spam Score</div>
                          <div className="text-2xl font-bold text-green-600">3%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === 'geo' && (
                <Card>
                  <CardHeader>
                    <CardTitle>GEO Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">AI-Powered GEO Insights</h4>
                        <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                          <li>• Content is well-structured for AI understanding</li>
                          <li>• Schema markup detected and valid</li>
                          <li>• Entity relationships clearly defined</li>
                          <li>• Natural language optimization: Excellent</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === 'recommendations' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actionable Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { priority: 'High', text: 'Optimize images to reduce page load time', impact: '+15 points' },
                        { priority: 'High', text: 'Add missing meta descriptions to 3 pages', impact: '+10 points' },
                        { priority: 'Medium', text: 'Improve internal linking structure', impact: '+8 points' },
                        { priority: 'Medium', text: 'Update outdated content (6 months old)', impact: '+5 points' },
                        { priority: 'Low', text: 'Add FAQ schema markup', impact: '+3 points' },
                      ].map((rec, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10 hover:border-viz-accent transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              rec.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                              rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{rec.text}</span>
                          </div>
                          <span className="text-sm font-semibold text-green-600">{rec.impact}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === 'saved' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-slate-500">
                      No saved reports yet. Analyze a URL and save the report to see it here.
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeView === 'history' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { url: 'example.com', date: '2 hours ago', score: 85 },
                        { url: 'mysite.com', date: '1 day ago', score: 78 },
                        { url: 'testsite.com', date: '3 days ago', score: 92 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10 hover:border-viz-accent transition-colors cursor-pointer">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{item.url}</div>
                            <div className="text-sm text-slate-500">{item.date}</div>
                          </div>
                          <div className="text-lg font-bold text-viz-accent">{item.score}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEODashboard;
