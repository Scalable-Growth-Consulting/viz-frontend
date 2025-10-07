/*
  SEO & GEO (Gen AI Engine Optimization) analysis utilities
  - Low-cost: all core checks run client-side over provided HTML
  - Optional PageSpeed Insights integration if API key provided
*/

export type SeoIssue = {
  severity: 'high' | 'medium' | 'low';
  message: string;
};

export type SeoGeoAnalysis = {
  url?: string;
  seoScore: number; // 0-100
  geoScore: number; // 0-100 (LLM/AI answerability & schema readiness)
  metrics: {
    title?: string;
    titleLength: number;
    metaDescription?: string;
    metaDescriptionLength: number;
    h1Count: number;
    h2Count: number;
    canonical?: string | null;
    robotsMeta?: string | null;
    lang?: string | null;
    ogTags: string[];
    twitterTags: string[];
    schemaTypes: string[];
    images: { total: number; missingAlt: number };
    links: { internal: number; external: number };
    wordCount: number;
    listCount: number;
    tableCount: number;
    faqPresent: boolean;
    howToPresent: boolean;
    summaryPresent: boolean;
  };
  issues: SeoIssue[];
  recommendations: string[];
  psi?: {
    overall?: number;
    seo?: number;
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
  };
  generated?: {
    faqJsonLd?: string;
    howToJsonLd?: string;
    summary?: string;
  };
};

function textContent(el: Element | null | undefined) {
  return (el?.textContent || '').trim();
}

function countWords(text: string) {
  return (text.match(/[A-Za-z0-9_\-']+/g) || []).length;
}

export class SeoGeoService {
  async fetchPage(url: string): Promise<string> {
    // Direct fetch; may be blocked by CORS depending on target site
    const resp = await fetch(url, { method: 'GET' });
    if (!resp.ok) throw new Error(`Failed to fetch page: ${resp.status}`);
    return await resp.text();
  }

  analyzeHtml(html: string, url?: string): SeoGeoAnalysis {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const head = doc.querySelector('head');
    const body = doc.querySelector('body');

    const title = textContent(doc.querySelector('title')) || undefined;
    const metaDesc = (doc.querySelector('meta[name="description"]') as HTMLMetaElement | null)?.content || undefined;
    const canonical = (doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href || null;
    const robotsMeta = (doc.querySelector('meta[name="robots"]') as HTMLMetaElement | null)?.content || null;
    const lang = doc.documentElement.getAttribute('lang');

    const h1Count = doc.querySelectorAll('h1').length;
    const h2Count = doc.querySelectorAll('h2').length;

    const ogTags = Array.from(doc.querySelectorAll('meta[property^="og:"]')).map(m => (m as HTMLMetaElement).getAttribute('property') || '');
    const twitterTags = Array.from(doc.querySelectorAll('meta[name^="twitter:"]')).map(m => (m as HTMLMetaElement).getAttribute('name') || '');

    const schemaTypes: string[] = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const data = JSON.parse(s.textContent || '{}');
        const type = Array.isArray(data['@type']) ? data['@type'].join(',') : data['@type'];
        if (type) schemaTypes.push(String(type));
      } catch { /* ignore */ }
    });

    const images = Array.from(doc.querySelectorAll('img'));
    const missingAlt = images.filter(img => !(img.getAttribute('alt') || '').trim()).length;

    let internal = 0, external = 0;
    const aTags = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
    aTags.forEach(a => {
      const href = a.getAttribute('href') || '';
      try {
        const u = new URL(href, url || window.location.href);
        if (!url) {
          // Without canonical base, consider same-origin as internal
          if (u.origin === window.location.origin) internal++; else external++;
        } else {
          const base = new URL(url);
          if (u.origin === base.origin) internal++; else external++;
        }
      } catch {
        // ignore invalid URLs
      }
    });

    const wordCount = countWords((head?.textContent || '') + ' ' + (body?.textContent || ''));
    const listCount = doc.querySelectorAll('ul,ol').length;
    const tableCount = doc.querySelectorAll('table').length;

    // GEO signals (Gen AI answerability/readiness)
    const faqPresent = schemaTypes.some(t => /FAQPage/i.test(t)) || !!doc.querySelector('[itemscope][itemtype*="FAQPage"]');
    const howToPresent = schemaTypes.some(t => /HowTo/i.test(t)) || !!doc.querySelector('[itemscope][itemtype*="HowTo"]');

    // Summary presence: first paragraph under main/hero-like area
    const summaryPresent = !!doc.querySelector('main p, article p, .hero p, .intro p');

    // Score heuristics
    let seoScore = 100;
    const issues: SeoIssue[] = [];

    if (!title) { seoScore -= 15; issues.push({ severity: 'high', message: 'Missing <title> tag' }); }
    const titleLength = (title || '').length;
    if (title && (titleLength < 30 || titleLength > 65)) { seoScore -= 5; issues.push({ severity: 'medium', message: 'Title length should be ~50–60 characters' }); }

    const metaDescriptionLength = (metaDesc || '').length;
    if (!metaDesc) { seoScore -= 10; issues.push({ severity: 'high', message: 'Missing meta description' }); }
    else if (metaDescriptionLength < 100 || metaDescriptionLength > 160) { seoScore -= 5; issues.push({ severity: 'medium', message: 'Meta description should be ~120–160 characters' }); }

    if (h1Count !== 1) { seoScore -= 8; issues.push({ severity: 'medium', message: 'Use exactly one H1 heading' }); }
    if (missingAlt > 0) { seoScore -= 5; issues.push({ severity: 'low', message: `${missingAlt} images missing alt text` }); }
    if (!canonical) { seoScore -= 5; issues.push({ severity: 'low', message: 'Add canonical link' }); }
    if (robotsMeta && /noindex/i.test(robotsMeta)) { seoScore -= 40; issues.push({ severity: 'high', message: 'Robots meta set to noindex' }); }
    if (!lang) { seoScore -= 3; issues.push({ severity: 'low', message: 'Set <html lang> attribute' }); }

    // GEO scoring
    let geoScore = 100;
    if (!faqPresent) { geoScore -= 8; issues.push({ severity: 'low', message: 'Add FAQ (FAQPage) schema for answerability' }); }
    if (!howToPresent) { geoScore -= 6; issues.push({ severity: 'low', message: 'Add HowTo schema if relevant' }); }
    if (!summaryPresent) { geoScore -= 6; issues.push({ severity: 'low', message: 'Add a crisp summary at the top for LLMs' }); }
    if (wordCount < 300) { geoScore -= 6; issues.push({ severity: 'low', message: 'Content is thin; aim for 600–1200 words for depth' }); }
    if (listCount < 1) { geoScore -= 4; issues.push({ severity: 'low', message: 'Use bullet lists for extractable key points' }); }

    // Recommendations
    const recommendations: string[] = [];
    if (!faqPresent) recommendations.push('Add an FAQ section with 3–5 common questions and answers.');
    if (!howToPresent) recommendations.push('Provide step-by-step HowTo for key tasks to improve featured snippets.');
    if (!summaryPresent) recommendations.push('Add a 2–3 sentence executive summary near the top.');
    if (missingAlt > 0) recommendations.push('Add descriptive alt attributes for all images.');
    if (!canonical) recommendations.push('Add a canonical link to avoid duplicate content issues.');
    if (!lang) recommendations.push('Set <html lang="en"> (or appropriate language code).');

    // Generated helpers
    const faqJsonLd = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is ${title || 'this page'} about?",
      "acceptedAnswer": { "@type": "Answer", "text": "Provide a concise, helpful answer here." }
    },
    {
      "@type": "Question",
      "name": "How do I get started?",
      "acceptedAnswer": { "@type": "Answer", "text": "Outline steps or link to your quickstart/how-to section." }
    }
  ]
}`;

    const howToJsonLd = `{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to accomplish the main task",
  "step": [
    { "@type": "HowToStep", "text": "Step 1: ..." },
    { "@type": "HowToStep", "text": "Step 2: ..." },
    { "@type": "HowToStep", "text": "Step 3: ..." }
  ]
}`;

    const analysis: SeoGeoAnalysis = {
      url,
      seoScore: Math.max(0, Math.min(100, Math.round(seoScore))),
      geoScore: Math.max(0, Math.min(100, Math.round(geoScore))),
      metrics: {
        title,
        titleLength,
        metaDescription: metaDesc,
        metaDescriptionLength,
        h1Count,
        h2Count,
        canonical,
        robotsMeta,
        lang,
        ogTags,
        twitterTags,
        schemaTypes,
        images: { total: images.length, missingAlt },
        links: { internal, external },
        wordCount,
        listCount,
        tableCount,
        faqPresent,
        howToPresent,
        summaryPresent,
      },
      issues,
      recommendations,
      generated: {
        faqJsonLd,
        howToJsonLd,
        summary: title ? `In 2–3 sentences, summarize: ${title}.` : 'Add a concise 2–3 sentence summary near the top of the page.'
      }
    };

    return analysis;
  }

  async runPageSpeedInsights(url: string, apiKey?: string) {
    if (!apiKey) return undefined;
    const base = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const u = `${base}?url=${encodeURIComponent(url)}&category=SEO&category=PERFORMANCE&strategy=mobile&key=${apiKey}`;
    const resp = await fetch(u);
    if (!resp.ok) throw new Error(`PSI error ${resp.status}`);
    const data = await resp.json();
    const lighthouse = data.lighthouseResult || {};
    const category = (name: string) => (lighthouse.categories?.[name]?.score ?? undefined);
    return {
      overall: lighthouse.categories ? Math.round(((category('performance') ?? 0) + (category('seo') ?? 0)) / 2 * 100) : undefined,
      seo: category('seo') !== undefined ? Math.round(category('seo') * 100) : undefined,
      performance: category('performance') !== undefined ? Math.round(category('performance') * 100) : undefined,
      accessibility: lighthouse.categories?.accessibility?.score !== undefined ? Math.round(lighthouse.categories.accessibility.score * 100) : undefined,
      bestPractices: lighthouse.categories?.['best-practices']?.score !== undefined ? Math.round(lighthouse.categories['best-practices'].score * 100) : undefined,
    };
  }
}

export const seoGeoService = new SeoGeoService();
