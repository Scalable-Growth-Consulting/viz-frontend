import type { AnalysisResult } from '../types';

export type SectionItem = {
  id: string;
  label: string;
  score: number;
  weight?: number; // 0..1
  definition?: string;
  children?: SectionItem[];
};

export type Section = {
  title: string;
  items: SectionItem[];
};

const round = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// SEO calculations - using ONLY actual API seo_score values
export function buildSEOSections(result: AnalysisResult): Section {
  // Get the actual seo_score component scores from API (these are 0-10 scale, convert to 0-100)
  const seoScore = (result as any).seoScore || {};
  
  // If seoScore exists, use it; otherwise calculate from onPage metrics
  const titleScore = seoScore.title_score ? round(seoScore.title_score * 10) : 
    (result.onPage.titleLength > 30 && result.onPage.titleLength < 60 ? 100 : 70);
  
  const metaScore = seoScore.meta_score ? round(seoScore.meta_score * 10) : 
    (result.onPage.metaDescriptionLength > 120 && result.onPage.metaDescriptionLength < 160 ? 100 : 
     result.onPage.metaDescriptionLength > 0 ? 70 : 0);
  
  const headingScore = seoScore.heading_score ? round(seoScore.heading_score * 10) : 
    (result.onPage.h1Count === 1 ? 100 : result.onPage.h1Count === 0 ? 30 : 60);
  
  const structuredScore = seoScore.structured_score ? round(seoScore.structured_score * 10) : 
    (result.onPage.schemaPresent ? 100 : 0);
  
  const contentScore = seoScore.content_score ? round(seoScore.content_score * 10) : 
    (result.onPage.wordCount > 1000 ? 100 : result.onPage.wordCount > 500 ? 85 : 70);
  
  const imageScore = seoScore.image_score ? round(seoScore.image_score * 10) : 
    round((result.onPage.imageCount > 0 ? 70 : 40) + (result.onPage.imageCount > 0 ? (result.onPage.imagesWithAlt / result.onPage.imageCount) * 30 : 0));
  
  const techScore = seoScore.tech_score ? round(seoScore.tech_score * 10) : 75;
  const canonicalScore = seoScore.canonical_score ? round(seoScore.canonical_score * 10) : 100;
  const linkScore = seoScore.link_score ? round(seoScore.link_score * 10) : 50;

  // Calculate parent scores as weighted averages
  const technicalFoundation = round(titleScore * 0.25 + metaScore * 0.20 + headingScore * 0.20 + structuredScore * 0.12 + techScore * 0.15 + canonicalScore * 0.08);
  const contentQuality = round(contentScore * 0.60 + imageScore * 0.40);
  const performanceMetrics = round(techScore * 1.0); // Tech score represents performance

  const items: SectionItem[] = [
    {
      id: 'technical',
      label: 'Technical Foundation',
      score: technicalFoundation,
      weight: 0.35,
      children: [
        { id: 'title', label: 'Title Tag', score: titleScore, weight: 0.25 },
        { id: 'meta', label: 'Meta Description', score: metaScore, weight: 0.20 },
        { id: 'heading', label: 'Heading Structure', score: headingScore, weight: 0.20 },
        { id: 'schema', label: 'Schema Markup', score: structuredScore, weight: 0.12 },
        { id: 'canonical', label: 'Canonical Tags', score: canonicalScore, weight: 0.08 },
      ],
    },
    {
      id: 'content',
      label: 'Content Quality',
      score: contentQuality,
      weight: 0.35,
      children: [
        { id: 'text', label: 'Text Content', score: contentScore, weight: 0.60 },
        { id: 'images', label: 'Image Optimization', score: imageScore, weight: 0.40 },
      ],
    },
    {
      id: 'performance',
      label: 'Performance & Links',
      score: performanceMetrics,
      weight: 0.30,
      children: [
        { id: 'tech', label: 'Technical Performance', score: techScore, weight: 0.60 },
        { id: 'links', label: 'Link Structure', score: linkScore, weight: 0.40 },
      ],
    },
  ];

  return { title: 'SEO Score Breakdown', items };
}

// GEO calculations - using ONLY actual API generative_ai values
export function buildGEOSections(result: AnalysisResult): Section {
  // Get actual values from API response (all are 0-100 scale already)
  const aiVisibilityRate = result.geo?.aiVisibilityRate ?? 0;
  const citationFrequency = result.geo?.citationFrequency ?? 0;
  const brandMentionScore = result.geo?.brandMentionScore ?? 0;
  const sentimentAccuracy = result.geo?.sentimentAccuracy ?? 0;
  const structuredDataScore = result.geo?.structuredDataScore ?? 0;
  const contextualRelevance = result.geo?.contextualRelevance ?? 0;
  const authoritySignals = result.geo?.authoritySignals ?? 0;
  const factualSignalScore = result.geo?.factualAccuracy ?? 0;
  const topicCoverage = result.geo?.topicCoverage ?? 0;

  // Calculate parent scores as weighted averages of actual API values
  const aiVisibility = aiVisibilityRate; // This is the main score from API
  const brandAuthority = round(brandMentionScore * 0.6 + authoritySignals * 0.4);
  const factualAccuracy = round(structuredDataScore * 0.5 + factualSignalScore * 0.5);
  const sentimentMessaging = round(sentimentAccuracy * 0.6 + contextualRelevance * 0.4);

  const items: SectionItem[] = [
    {
      id: 'ai-visibility',
      label: 'AI Visibility',
      score: aiVisibility,
      weight: 0.35,
      children: [
        { id: 'ai-visibility-rate', label: 'AI Visibility Rate', score: aiVisibilityRate, weight: 0.60 },
        { id: 'citation-frequency', label: 'Citation Frequency', score: citationFrequency, weight: 0.40 },
      ],
    },
    {
      id: 'brand-authority',
      label: 'Brand Authority',
      score: brandAuthority,
      weight: 0.25,
      children: [
        { id: 'brand-mentions', label: 'Brand Mentions', score: brandMentionScore, weight: 0.60 },
        { id: 'authority-signals', label: 'Authority Signals', score: authoritySignals, weight: 0.40 },
      ],
    },
    {
      id: 'factual-accuracy',
      label: 'Factual Accuracy',
      score: factualAccuracy,
      weight: 0.20,
      children: [
        { id: 'structured-data', label: 'Structured Data', score: structuredDataScore, weight: 0.50 },
        { id: 'factual-signals', label: 'Factual Signals', score: factualSignalScore, weight: 0.50 },
      ],
    },
    {
      id: 'sentiment',
      label: 'Sentiment & Messaging',
      score: sentimentMessaging,
      weight: 0.20,
      children: [
        { id: 'sentiment-accuracy', label: 'Sentiment Accuracy', score: sentimentAccuracy, weight: 0.60 },
        { id: 'contextual-relevance', label: 'Contextual Relevance', score: contextualRelevance, weight: 0.40 },
      ],
    },
  ];

  return { title: 'GEO Score Breakdown', items };
}
