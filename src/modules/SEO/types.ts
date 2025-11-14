export type PillarScores = {
  visibility: number; // indexability, headings, internal links
  trust: number; // schema, domain authority proxy, backlinks proxy
  relevance: number; // content quality, keyword density, meta/title relevance
};

export type OnPageMetrics = {
  title?: string;
  titleLength: number;
  metaDescription?: string;
  metaDescriptionLength: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  wordCount: number;
  keywordDensity: Array<{ term: string; density: number }>;
  imageCount: number;
  imagesWithAlt: number;
  schemaPresent: boolean;
  internalLinks: number;
  externalLinks: number;
  pageSpeed?: {
    performance?: number; // 0-100
    lcp?: number; // seconds
    cls?: number;
  } | null;
};

export type GeoSignals = {
  // Core GEO metrics for Generative AI Engine Optimization
  aiVisibilityRate: number; // 0-100: likelihood of appearing in AI responses
  citationFrequency: number; // 0-100: how often content gets cited by AI
  brandMentionScore: number; // 0-100: brand recognition in AI responses
  sentimentAccuracy: number; // 0-100: positive/accurate AI portrayal
  
  // Content structure for AI optimization
  structuredDataScore: number; // 0-100: AI-friendly content structure
  contextualRelevance: number; // 0-100: content alignment with AI reasoning
  authoritySignals: number; // 0-100: expertise/trust indicators for AI
  
  // AI platform readiness
  conversationalOptimization: number; // 0-100: content formatted for AI conversations
  factualAccuracy: number; // 0-100: clear, verifiable information
  topicCoverage: number; // 0-100: comprehensive topic coverage
  
  // Legacy fields (kept for compatibility)
  language?: string;
  hreflangTags: Array<{ lang: string; href: string }>; 
  localKeywords: string[];
};

export type OffPageIndicators = {
  backlinkCountEstimate?: number | null;
  domainTrustScore?: number | null; // 0-100 proxy
  competitorKeywordOverlap?: Array<{ competitor: string; overlap: number }>; // 0-100
};

export type AnalysisInput = {
  url?: string;
  rawHtml?: string;
  competitors?: string[]; // competitor URLs or labels
  targetMarket?: string; // city/region
  primaryKeyword?: string;
};

export type AnalysisResult = {
  url?: string;
  computedAt: string;
  overallScore: number; // 0-100
  // Raw scores for display purposes
  seoScoreOutOf10?: number; // 0-10
  geoScoreOutOf100?: number; // 0-100
  // Raw seo_score object from API for Score Architecture
  seoScore?: any;
  pillars: PillarScores; 
  onPage: OnPageMetrics;
  geo: GeoSignals;
  offPage: OffPageIndicators;
  topQuickFixes: string[];
  missedOpportunities: string[];
  competitorSummaries?: Array<{ url: string; topTerms: string[]; title?: string }>; 
};
