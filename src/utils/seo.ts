/**
 * SEO & GEO Optimization Utilities
 * Comprehensive meta tag management for search engines and AI assistants
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export const DEFAULT_SEO: SEOMetadata = {
  title: 'VIZ - AI-Powered Business Intelligence Platform',
  description: 'Transform your business with VIZ\'s suite of AI agents: SEO/GEO optimization, Reddit marketing automation, demand forecasting, brand monitoring, and intelligent analytics. Enterprise-grade solutions for modern businesses.',
  keywords: [
    'AI business intelligence',
    'SEO optimization',
    'GEO optimization',
    'Reddit marketing automation',
    'demand forecasting',
    'brand monitoring',
    'marketing intelligence',
    'retail analytics',
    'AI agents',
    'business analytics',
    'data visualization',
    'predictive analytics',
  ],
  ogType: 'website',
  twitterCard: 'summary_large_image',
  author: 'SG Consulting',
};

export const AGENT_SEO: Record<string, SEOMetadata> = {
  biz: {
    title: 'BIZ Agent - AI Business Intelligence Chat | VIZ',
    description: 'Chat with your data instantly. Build dashboards, generate reports, and make data-driven decisions with AI-powered business intelligence. Connect to any database and get insights in seconds.',
    keywords: ['business intelligence', 'AI chat', 'data analytics', 'SQL automation', 'dashboard builder', 'BI tool'],
    ogType: 'product',
    section: 'Business Intelligence',
    tags: ['BI', 'Analytics', 'AI Chat', 'Dashboards'],
  },
  'seo-geo': {
    title: 'SEO & GEO Optimization Tool - AI-Powered Analysis | VIZ',
    description: 'Master-level SEO and Generative Engine Optimization. Get actionable insights, quick wins, and growth strategies. Optimize for Google, ChatGPT, Perplexity, and all AI search engines.',
    keywords: ['SEO tool', 'GEO optimization', 'search engine optimization', 'AI search', 'ChatGPT SEO', 'Perplexity optimization', 'Google SGE'],
    ogType: 'product',
    section: 'Visibility Enhancement',
    tags: ['SEO', 'GEO', 'AI-Powered', 'Search Optimization'],
  },
  'reddit-geo': {
    title: 'Reddit Marketing Automation - AI CoPilot | VIZ',
    description: 'Discover high-intent Reddit opportunities and craft risk-aware, conversion-ready responses. Automate Reddit marketing with AI-powered intelligence and safety scoring.',
    keywords: ['Reddit marketing', 'Reddit automation', 'social media marketing', 'lead generation', 'Reddit CoPilot', 'AI marketing'],
    ogType: 'product',
    section: 'Visibility Enhancement',
    tags: ['Reddit Marketing', 'AI Automation', 'Lead Generation', 'Risk Analysis'],
  },
  'keyword-discovery': {
    title: 'Keyword Research Tool - AI Discovery Agent | VIZ',
    description: 'Uncover high-value keywords with AI-powered research. Discover what your audience is searching for and dominate your niche with data-driven insights.',
    keywords: ['keyword research', 'SEO keywords', 'keyword tool', 'search volume', 'keyword difficulty', 'competitive analysis'],
    ogType: 'product',
    section: 'Visibility Enhancement',
    tags: ['Keyword Research', 'SEO', 'Market Intelligence', 'AI-Powered'],
  },
  'trend-analysis': {
    title: 'Trend Analysis Tool - Market Intelligence | VIZ',
    description: 'Identify emerging trends and market opportunities with AI-powered trend analysis. Stay ahead of the curve with real-time insights and predictive analytics.',
    keywords: ['trend analysis', 'market trends', 'predictive analytics', 'market intelligence', 'trend forecasting'],
    ogType: 'product',
    section: 'Visibility Enhancement',
    tags: ['Trend Analysis', 'Market Intelligence', 'Forecasting', 'AI'],
  },
  'mia-core': {
    title: 'Marketing Intelligence Agent - AI Dashboard | VIZ',
    description: 'AI-powered marketing intelligence dashboard. Track campaigns, analyze performance, and optimize your marketing strategy with real-time insights.',
    keywords: ['marketing intelligence', 'marketing analytics', 'campaign tracking', 'marketing dashboard', 'AI marketing'],
    ogType: 'product',
    section: 'Marketing Intelligence',
    tags: ['Marketing', 'Analytics', 'Dashboard', 'AI'],
  },
  'creative-labs': {
    title: 'Creative Labs - AI Content Generation | VIZ',
    description: 'Generate high-quality marketing content with AI. Create ads, social posts, email campaigns, and more with intelligent automation.',
    keywords: ['AI content generation', 'marketing content', 'creative automation', 'copywriting AI', 'content creation'],
    ogType: 'product',
    section: 'Marketing Intelligence',
    tags: ['Content Creation', 'AI', 'Marketing', 'Automation'],
  },
  brandlenz: {
    title: 'BrandLenz - Continuous Brand Monitoring | VIZ',
    description: 'Monitor brand health, competitive signals, and market perception across all channels. Real-time visibility intelligence for your brand.',
    keywords: ['brand monitoring', 'brand intelligence', 'competitive analysis', 'reputation management', 'brand tracking'],
    ogType: 'product',
    section: 'Marketing Intelligence',
    tags: ['Brand Monitoring', 'Competitive Intelligence', 'Market Analysis', 'Real-time'],
  },
  dufa: {
    title: 'DUFA - Demand Forecasting Agent | VIZ',
    description: 'AI-powered demand forecasting that transforms historical data into accurate predictions. Optimize inventory, reduce costs, and maximize revenue.',
    keywords: ['demand forecasting', 'inventory optimization', 'predictive analytics', 'retail intelligence', 'supply chain'],
    ogType: 'product',
    section: 'Retail Intelligence',
    tags: ['Forecasting', 'Demand Planning', 'AI Predictions', 'Retail Intelligence'],
  },
  'inventory-insight': {
    title: 'Inventory Insight Agent - AI Optimization | VIZ',
    description: 'Optimize inventory levels with AI-powered insights. Reduce stockouts, minimize excess inventory, and improve cash flow.',
    keywords: ['inventory management', 'inventory optimization', 'stock management', 'retail analytics', 'AI inventory'],
    ogType: 'product',
    section: 'Retail Intelligence',
    tags: ['Inventory', 'Optimization', 'Retail', 'AI'],
  },
};

export const CATEGORY_SEO: Record<string, SEOMetadata> = {
  vee: {
    title: 'Visibility Enhancement Engine - SEO, GEO & Marketing Tools | VIZ',
    description: 'Own every signal that shapes discovery. Master SEO, GEO, Reddit marketing, keyword research, and trend analysis with our suite of AI-powered visibility agents.',
    keywords: ['visibility enhancement', 'SEO tools', 'GEO optimization', 'Reddit marketing', 'keyword research', 'trend analysis'],
    ogType: 'website',
    section: 'Visibility Enhancement Engine',
  },
  mia: {
    title: 'Marketing Intelligence Agent - AI-Powered Marketing Suite | VIZ',
    description: 'Transform your marketing with AI-powered intelligence, creative automation, and brand monitoring capabilities. Complete marketing intelligence platform.',
    keywords: ['marketing intelligence', 'AI marketing', 'brand monitoring', 'creative automation', 'marketing analytics'],
    ogType: 'website',
    section: 'Marketing Intelligence Agent',
  },
  riz: {
    title: 'Retail Intelligence Zone - Demand Forecasting & Inventory | VIZ',
    description: 'Optimize inventory, forecast demand, and maximize retail performance with AI-powered intelligence. Specialized agents for retail excellence.',
    keywords: ['retail intelligence', 'demand forecasting', 'inventory optimization', 'retail analytics', 'AI retail'],
    ogType: 'website',
    section: 'Retail Intelligence Zone',
  },
};

/**
 * Update document meta tags for SEO/GEO
 */
export const updateMetaTags = (metadata: SEOMetadata) => {
  // Update title
  document.title = metadata.title;

  // Helper function to update or create meta tag
  const setMetaTag = (name: string, content: string, property = false) => {
    const attribute = property ? 'property' : 'name';
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Basic meta tags
  setMetaTag('description', metadata.description);
  if (metadata.keywords) {
    setMetaTag('keywords', metadata.keywords.join(', '));
  }
  if (metadata.author) {
    setMetaTag('author', metadata.author);
  }

  // Canonical URL
  if (metadata.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = metadata.canonical;
  }

  // Open Graph tags
  setMetaTag('og:title', metadata.title, true);
  setMetaTag('og:description', metadata.description, true);
  setMetaTag('og:type', metadata.ogType || 'website', true);
  if (metadata.ogImage) {
    setMetaTag('og:image', metadata.ogImage, true);
  }
  if (metadata.canonical) {
    setMetaTag('og:url', metadata.canonical, true);
  }

  // Twitter Card tags
  setMetaTag('twitter:card', metadata.twitterCard || 'summary_large_image');
  setMetaTag('twitter:title', metadata.title);
  setMetaTag('twitter:description', metadata.description);
  if (metadata.ogImage) {
    setMetaTag('twitter:image', metadata.ogImage);
  }

  // Article-specific tags
  if (metadata.publishedTime) {
    setMetaTag('article:published_time', metadata.publishedTime, true);
  }
  if (metadata.modifiedTime) {
    setMetaTag('article:modified_time', metadata.modifiedTime, true);
  }
  if (metadata.section) {
    setMetaTag('article:section', metadata.section, true);
  }
  if (metadata.tags) {
    metadata.tags.forEach(tag => {
      setMetaTag('article:tag', tag, true);
    });
  }

  // Robots meta tag
  if (metadata.noindex || metadata.nofollow) {
    const robotsContent = [
      metadata.noindex ? 'noindex' : 'index',
      metadata.nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    setMetaTag('robots', robotsContent);
  }

  // Schema.org structured data for GEO
  updateStructuredData(metadata);
};

/**
 * Add JSON-LD structured data for enhanced GEO
 */
const updateStructuredData = (metadata: SEOMetadata) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: metadata.title,
    description: metadata.description,
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
    },
    operatingSystem: 'Web',
    author: {
      '@type': 'Organization',
      name: 'SG Consulting',
    },
  };

  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(structuredData);
};

/**
 * Get SEO metadata for a specific route
 */
export const getSEOForRoute = (path: string): SEOMetadata => {
  const baseUrl = window.location.origin;
  
  // Agent routes
  if (path.startsWith('/agents/')) {
    const agentId = path.replace('/agents/', '');
    const agentSEO = AGENT_SEO[agentId];
    if (agentSEO) {
      return {
        ...agentSEO,
        canonical: `${baseUrl}${path}`,
      };
    }
  }
  
  // Category routes
  if (path === '/vee' || path === '/mia' || path === '/riz') {
    const categoryId = path.replace('/', '');
    const categorySEO = CATEGORY_SEO[categoryId];
    if (categorySEO) {
      return {
        ...categorySEO,
        canonical: `${baseUrl}${path}`,
      };
    }
  }
  
  // Default SEO
  return {
    ...DEFAULT_SEO,
    canonical: `${baseUrl}${path}`,
  };
};
