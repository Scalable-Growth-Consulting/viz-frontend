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
  language?: string;
  hreflangTags: Array<{ lang: string; href: string }>; 
  nap?: {
    name?: string;
    address?: string;
    phone?: string;
  };
  localKeywords: string[]; // detected city/region
  serverLocation?: string | null; // placeholder
  googleBusinessPresent?: boolean | null; // placeholder
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
  pillars: PillarScores; 
  onPage: OnPageMetrics;
  geo: GeoSignals;
  offPage: OffPageIndicators;
  topQuickFixes: string[];
  missedOpportunities: string[];
  competitorSummaries?: Array<{ url: string; topTerms: string[]; title?: string }>; 
};
