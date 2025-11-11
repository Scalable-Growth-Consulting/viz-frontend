import type { AnalysisResult } from '../types';

export interface TreeNode {
  id: string;
  label: string;
  value: number;
  weight?: number;
  color: string;
  description?: string;
  children?: TreeNode[];
}

export const buildSEOTree = (result: AnalysisResult): TreeNode[] => {
  const seoScore = Math.round(result.seoScoreOutOf10 * 10);

  // Child values
  const titleVal = result.onPage.titleLength > 30 && result.onPage.titleLength < 60 ? 100 : 70;
  const metaDescVal = result.onPage.metaDescriptionLength > 120 && result.onPage.metaDescriptionLength < 160 ? 100 : 70;
  const metaInfoVal = Math.round(titleVal * 0.5 + metaDescVal * 0.5);

  const h1Val = result.onPage.h1Count === 1 ? 100 : result.onPage.h1Count === 0 ? 30 : 60;
  const subHeadVal = Math.round(((result.onPage.h2Count > 0 ? 90 : 50) + (result.onPage.h3Count > 0 ? 80 : 50)) / 2);
  const contentStructureVal = Math.round(h1Val * 0.5 + subHeadVal * 0.5);

  const schemaVal = result.onPage.schemaPresent ? 100 : 0;
  const technicalFoundationVal = Math.round(metaInfoVal * 0.4 + contentStructureVal * 0.3 + schemaVal * 0.3);

  const textContentVal = result.onPage.wordCount > 1000 ? 100 : result.onPage.wordCount > 500 ? 85 : result.onPage.wordCount > 300 ? 70 : 50;
  const mediaVal = Math.round(
    (result.onPage.imageCount > 0 ? 80 : 40) + (result.onPage.imageCount > 0 ? (result.onPage.imagesWithAlt / result.onPage.imageCount) * 20 : 0)
  );
  const contentQualityVal = Math.round(textContentVal * 0.6 + mediaVal * 0.4);

  const lcpVal = result.onPage.pageSpeed ? (result.onPage.pageSpeed.lcp < 2.5 ? 100 : result.onPage.pageSpeed.lcp < 4 ? 70 : 40) : undefined;
  const clsVal = result.onPage.pageSpeed ? (result.onPage.pageSpeed.cls < 0.1 ? 100 : result.onPage.pageSpeed.cls < 0.25 ? 70 : 40) : undefined;
  const performanceParentVal = typeof lcpVal === 'number' && typeof clsVal === 'number'
    ? Math.round(lcpVal * 0.4 + clsVal * 0.3 + (result.onPage.pageSpeed?.performance || 75) * 0.3)
    : (result.onPage.pageSpeed?.performance || 75);

  return [
    {
      id: 'technical',
      label: 'Technical Foundation',
      value: technicalFoundationVal,
      weight: 0.35,
      color: 'from-violet-500 to-purple-600',
      description: 'Core technical SEO elements including meta tags, headings, and structure',
      children: [
        {
          id: 'meta',
          label: 'Meta Information',
          value: metaInfoVal,
          weight: 0.4,
          color: 'from-violet-400 to-purple-500',
          description: 'Title tags and meta descriptions optimized for search engines',
          children: [
            {
              id: 'title',
              label: 'Title Tag',
              value: titleVal,
              weight: 0.5,
              color: 'from-violet-300 to-purple-400',
              description: `${result.onPage.titleLength} characters (optimal: 30-60)`,
            },
            {
              id: 'meta-desc',
              label: 'Meta Description',
              value: metaDescVal,
              weight: 0.5,
              color: 'from-purple-300 to-indigo-400',
              description: `${result.onPage.metaDescriptionLength} characters (optimal: 120-160)`,
            },
          ],
        },
        {
          id: 'structure',
          label: 'Content Structure',
          value: contentStructureVal,
          weight: 0.3,
          color: 'from-indigo-400 to-blue-500',
          description: 'Heading hierarchy and content organization',
          children: [
            {
              id: 'h1',
              label: 'H1 Headings',
              value: h1Val,
              weight: 0.5,
              color: 'from-indigo-300 to-blue-400',
              description: `${result.onPage.h1Count} H1 tag(s) (optimal: 1)`,
            },
            {
              id: 'h2-h3',
              label: 'Subheadings (H2/H3)',
              value: subHeadVal,
              weight: 0.5,
              color: 'from-blue-300 to-cyan-400',
              description: `${result.onPage.h2Count} H2, ${result.onPage.h3Count} H3 tags`,
            },
          ],
        },
        {
          id: 'schema',
          label: 'Schema Markup',
          value: schemaVal,
          weight: 0.3,
          color: 'from-cyan-400 to-teal-500',
          description: 'Structured data for rich search results',
        },
      ],
    },
    {
      id: 'content',
      label: 'Content Quality',
      value: contentQualityVal,
      weight: 0.35,
      color: 'from-emerald-500 to-green-600',
      description: 'Content depth, richness, and multimedia elements',
      children: [
        {
          id: 'text-content',
          label: 'Text Content',
          value: textContentVal,
          weight: 0.6,
          color: 'from-emerald-400 to-green-500',
          description: `${result.onPage.wordCount} words (optimal: 1000+)`,
        },
        {
          id: 'media',
          label: 'Media Elements',
          value: mediaVal,
          weight: 0.4,
          color: 'from-green-400 to-teal-500',
          description: `${result.onPage.imageCount} images, ${Math.round((result.onPage.imagesWithAlt / result.onPage.imageCount) * 100)}% with alt text`,
        },
      ],
    },
    {
      id: 'performance',
      label: 'Performance Metrics',
      value: performanceParentVal,
      weight: 0.3,
      color: 'from-orange-500 to-amber-600',
      description: 'Page speed and Core Web Vitals',
      children: result.onPage.pageSpeed ? [
        {
          id: 'lcp',
          label: 'Largest Contentful Paint',
          value: lcpVal!,
          weight: 0.4,
          color: 'from-orange-400 to-amber-500',
          description: `${result.onPage.pageSpeed.lcp}s (optimal: <2.5s)`,
        },
        {
          id: 'cls',
          label: 'Cumulative Layout Shift',
          value: clsVal!,
          weight: 0.3,
          color: 'from-yellow-400 to-orange-500',
          description: `${result.onPage.pageSpeed.cls} (optimal: <0.1)`,
        },
      ] : [],
    },
  ];
};

export const buildGEOTree = (result: AnalysisResult): TreeNode[] => {
  const geoScore = result.geoScoreOutOf100 || 69;

  // Derive child metrics first for consistent parent aggregation
  const semanticHtmlVal = result.onPage.schemaPresent ? 95 : 60;
  const readabilityVal = result.onPage.wordCount > 500 ? 85 : 65;
  const contentStructureVal = Math.round(semanticHtmlVal * 0.6 + readabilityVal * 0.4);
  const citationFrequencyVal = result.geo?.citationFrequency ?? 70;
  const structuredDataScoreVal = result.geo?.structuredDataScore ?? 25;
  const citationPotentialVal = Math.round(citationFrequencyVal * 0.7 + structuredDataScoreVal * 0.3);
  const aiVisibilityVal = Math.round(contentStructureVal * 0.5 + citationPotentialVal * 0.5);

  return [
    {
      id: 'ai-visibility',
      label: 'AI Visibility',
      value: aiVisibilityVal,
      weight: 0.35,
      color: 'from-blue-500 to-cyan-600',
      description: 'How well your content is structured for AI engines to understand and cite',
      children: [
        {
          id: 'content-structure',
          label: 'Content Structure',
          value: contentStructureVal,
          weight: 0.5,
          color: 'from-blue-400 to-cyan-500',
          description: 'Clear headings, lists, and semantic HTML for AI parsing',
          children: [
            {
              id: 'semantic-html',
              label: 'Semantic HTML',
              value: semanticHtmlVal,
              weight: 0.6,
              color: 'from-blue-300 to-cyan-400',
              description: 'Proper use of semantic tags and structured data',
            },
            {
              id: 'readability',
              label: 'AI Readability',
              value: readabilityVal,
              weight: 0.4,
              color: 'from-cyan-300 to-teal-400',
              description: 'Clear, concise content that AI can easily process',
            },
          ],
        },
        {
          id: 'citation-potential',
          label: 'Citation Potential',
          value: citationPotentialVal,
          weight: 0.5,
          color: 'from-cyan-400 to-teal-500',
          description: 'Likelihood of being cited by AI engines',
        },
      ],
    },
    {
      id: 'brand-authority',
      label: 'Brand Authority',
      value: result.geo?.brandMentionScore || 43,
      weight: 0.25,
      color: 'from-purple-500 to-pink-600',
      description: 'Brand mentions and authority signals for AI engines',
      children: [
        {
          id: 'brand-mentions',
          label: 'Brand Mentions',
          value: result.geo?.brandMentionScore || 43,
          weight: 0.6,
          color: 'from-purple-400 to-pink-500',
          description: 'Frequency and context of brand mentions',
        },
        {
          id: 'authority-signals',
          label: 'Authority Signals',
          value: result.pillars?.trust || 50,
          weight: 0.4,
          color: 'from-pink-400 to-rose-500',
          description: 'Trust indicators and credibility markers',
        },
      ],
    },
    {
      id: 'factual-accuracy',
      label: 'Factual Accuracy',
      value: result.geo?.factualAccuracy || 100,
      weight: 0.2,
      color: 'from-green-500 to-emerald-600',
      description: 'Accuracy and reliability of information for AI fact-checking',
      children: [
        {
          id: 'data-sources',
          label: 'Data & Sources',
          value: result.geo?.structuredDataScore || 25,
          weight: 0.5,
          color: 'from-green-400 to-emerald-500',
          description: 'Citations, references, and data sources',
        },
        {
          id: 'consistency',
          label: 'Content Consistency',
          value: result.geo?.factualAccuracy || 100,
          weight: 0.5,
          color: 'from-emerald-400 to-teal-500',
          description: 'Consistency across content and claims',
        },
      ],
    },
    {
      id: 'sentiment',
      label: 'Sentiment & Messaging',
      value: result.geo?.sentimentAccuracy || 50,
      weight: 0.2,
      color: 'from-indigo-500 to-violet-600',
      description: 'Positive messaging and sentiment analysis',
      children: [
        {
          id: 'tone',
          label: 'Content Tone',
          value: result.geo?.sentimentAccuracy || 50,
          weight: 0.6,
          color: 'from-indigo-400 to-violet-500',
          description: 'Professional, positive, and engaging tone',
        },
        {
          id: 'context',
          label: 'Contextual Relevance',
          value: result.geo?.contextualRelevance || 55,
          weight: 0.4,
          color: 'from-violet-400 to-purple-500',
          description: 'Content relevance to user queries and intent',
        },
      ],
    },
  ];
};
