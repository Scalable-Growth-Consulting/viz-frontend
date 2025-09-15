import { AnalysisInput, AnalysisResult, GeoSignals, OffPageIndicators, OnPageMetrics, PillarScores } from '../types';

const STOPWORDS = new Set([
  'the','and','is','to','in','of','a','for','on','with','this','that','by','as','from','it','at','be','or','an','are','we','you','your','our','us','their','they','he','she','them','its','but','if','will','can','about','more','all','not','out','up','so','what','when','how','why'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !STOPWORDS.has(w));
}

function extractText(doc: Document): string {
  // clone body and remove script/style/nav/footer
  const clone = doc.body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
  const removable = ['nav','footer','header','aside'];
  removable.forEach((tag) => clone.querySelectorAll(tag).forEach((el) => el.remove()))
  return clone.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function computeKeywordDensity(text: string, primary?: string) {
  const tokens = tokenize(text);
  const total = tokens.length || 1;
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const terms = Object.entries(freq)
    .sort((a,b)=>b[1]-a[1])
    .slice(0, 25)
    .map(([term, count]) => ({ term, density: +(100 * count / total).toFixed(2) }));
  // ensure primary keyword is present in list
  if (primary) {
    const key = primary.toLowerCase();
    const count = freq[key] || 0;
    const density = +(100 * count / total).toFixed(2);
    const idx = terms.findIndex((t)=>t.term===key);
    if (idx === -1) terms.unshift({ term: key, density });
  }
  return terms;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const html = await res.text();
    return html;
  } catch {
    return null;
  }
}

function parseHtml(html: string, baseUrl?: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const title = doc.querySelector('title')?.textContent?.trim();
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || undefined;
  const h1Count = doc.querySelectorAll('h1').length;
  const h2Count = doc.querySelectorAll('h2').length;
  const h3Count = doc.querySelectorAll('h3').length;
  const text = extractText(doc);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const images = Array.from(doc.querySelectorAll('img'));
  const imagesWithAlt = images.filter((img)=> (img.getAttribute('alt')||'').trim().length>0).length;
  const schemaPresent = !!doc.querySelector('script[type="application/ld+json"]') || !!doc.querySelector('[itemscope],[itemtype]');
  const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
  const internalLinks = anchors.filter((a)=> {
    try {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) return false;
      const u = new URL(href, baseUrl || 'http://example.com');
      if (!baseUrl) return href.startsWith('/') || href.startsWith('.');
      return new URL(baseUrl).hostname === u.hostname;
    } catch { return false; }
  }).length;
  const externalLinks = anchors.length - internalLinks;

  const lang = doc.documentElement.getAttribute('lang') || undefined;
  const hreflangTags = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]'))
    .map((l)=> ({ lang: l.getAttribute('hreflang') || '', href: l.getAttribute('href') || '' }));

  // NAP detection (simple heuristics)
  const phoneMatch = text.match(/(?:\+?\d[\d\s-.()]{6,}\d)/);
  const addressHints = text.match(/\b(street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd\.|suite|ste\.|floor|fl\.)\b/i);

  const onPage: OnPageMetrics = {
    title,
    titleLength: title?.length || 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length || 0,
    h1Count,
    h2Count,
    h3Count,
    wordCount,
    keywordDensity: computeKeywordDensity(text),
    imageCount: images.length,
    imagesWithAlt,
    schemaPresent,
    internalLinks,
    externalLinks,
    pageSpeed: null,
  };

  const geo: GeoSignals = {
    language: lang,
    hreflangTags,
    nap: phoneMatch || addressHints ? { phone: phoneMatch?.[0] } : undefined,
    localKeywords: [],
    serverLocation: null,
    googleBusinessPresent: null,
  };

  return { onPage, geo };
}

function scoreOnPage(m: OnPageMetrics): number {
  let score = 0;
  const clamp = (x:number)=> Math.max(0, Math.min(100, x));
  // Title length: optimal 35-65
  score += Math.abs(50 - Math.abs(50 - Math.min(70, m.titleLength))) * 0.3;
  // Meta length: optimal 120-160
  score += Math.abs(140 - Math.abs(140 - Math.min(200, m.metaDescriptionLength))) * 0.25;
  // Headings presence
  score += Math.min(20, m.h1Count * 10) + Math.min(10, m.h2Count * 2) + Math.min(5, m.h3Count);
  // Content depth
  score += Math.min(20, Math.floor(m.wordCount / 250) * 4);
  // Alt coverage
  const altCoverage = m.imageCount ? (100 * m.imagesWithAlt / m.imageCount) : 100;
  score += (altCoverage * 0.1);
  // Schema
  if (m.schemaPresent) score += 5;
  // Internal links
  score += Math.min(10, Math.floor(m.internalLinks / 10) * 2);
  return clamp(Math.round(score));
}

function scoreGeo(g: GeoSignals): number {
  let score = 0;
  const clamp = (x:number)=> Math.max(0, Math.min(100, x));
  if (g.language) score += 20;
  if (g.hreflangTags?.length) score += Math.min(20, g.hreflangTags.length * 5);
  if (g.nap?.phone) score += 20;
  if (g.localKeywords?.length) score += Math.min(40, g.localKeywords.length * 5);
  return clamp(Math.round(score));
}

function scoreOffPage(o: OffPageIndicators): number {
  let score = 0;
  const clamp = (x:number)=> Math.max(0, Math.min(100, x));
  if (typeof o.domainTrustScore === 'number') score += o.domainTrustScore;
  if (typeof o.backlinkCountEstimate === 'number') score += Math.min(40, Math.log10(1 + o.backlinkCountEstimate) * 10);
  if (o.competitorKeywordOverlap && o.competitorKeywordOverlap.length) {
    score += Math.min(20, o.competitorKeywordOverlap.reduce((a,b)=>a+(b.overlap||0),0)/(o.competitorKeywordOverlap.length||1));
  }
  return clamp(Math.round(score));
}

async function maybePageSpeed(url?: string) {
  try {
    const key = (import.meta as any).env?.VITE_PAGESPEED_API_KEY;
    if (!key || !url) return null;
    const resp = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${key}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const lighthouseScore = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
    const lcpAudit = data.lighthouseResult?.audits?.['largest-contentful-paint'];
    const clsAudit = data.lighthouseResult?.audits?.['cumulative-layout-shift'];
    return { performance: lighthouseScore, lcp: lcpAudit?.numericValue || null, cls: clsAudit?.numericValue || null };
  } catch {
    return null;
  }
}

export async function analyzeSEOGeo(input: AnalysisInput): Promise<AnalysisResult> {
  let html = input.rawHtml || '';
  let baseUrl = input.url;
  if (!html && input.url) {
    html = (await fetchHtml(input.url)) || '';
  }
  if (!html) {
    // Return minimal result prompting user to paste HTML
    const empty: OnPageMetrics = {
      titleLength: 0, metaDescriptionLength: 0, h1Count: 0, h2Count: 0, h3Count: 0, wordCount: 0,
      keywordDensity: [], imageCount: 0, imagesWithAlt: 0, schemaPresent: false, internalLinks: 0, externalLinks: 0, pageSpeed: null,
    };
    const pillars: PillarScores = { visibility: 10, trust: 10, relevance: 10 };
    return {
      url: input.url,
      computedAt: new Date().toISOString(),
      overallScore: 15,
      pillars,
      onPage: empty,
      geo: { hreflangTags: [], localKeywords: [] },
      offPage: {},
      topQuickFixes: ['Paste raw HTML so we can analyze on-page content accurately', 'Add a concise, keyword-focused title tag', 'Write a compelling meta description (120–160 chars)'],
      missedOpportunities: ['Set language and hreflang for GEO targeting', 'Add schema markup (Organization, WebPage)', 'Add internal links to pillar pages'],
    };
  }

  const { onPage, geo } = parseHtml(html, baseUrl);

  // page speed if we have a URL and key
  onPage.pageSpeed = await maybePageSpeed(baseUrl);

  // augment keyword density with primary keyword if provided
  if (onPage.keywordDensity?.length && input.primaryKeyword) {
    // recompute with primary keyword emphasized at top
    const textApprox = onPage.keywordDensity.map((k)=>k.term.repeat(Math.max(1, Math.floor(k.density)))).join(' ');
    onPage.keywordDensity = computeKeywordDensity(textApprox + ' ' + input.primaryKeyword, input.primaryKeyword);
  }

  // Geo local keyword detection (simple): look for targetMarket or region words inside title/description/body tokens
  const concatText = [onPage.title || '', onPage.metaDescription || ''].join(' ').toLowerCase();
  const locs: string[] = [];
  if (input.targetMarket) {
    const tm = input.targetMarket.toLowerCase();
    if (concatText.includes(tm)) locs.push(input.targetMarket);
  }
  geo.localKeywords = Array.from(new Set([...(geo.localKeywords||[]), ...locs]));

  const onPageScore = scoreOnPage(onPage);
  const geoScore = scoreGeo(geo);
  const offPage: OffPageIndicators = {};

  // Competitor analysis (basic keyword overlap)
  let competitorSummaries: Array<{ url: string; topTerms: string[]; title?: string }> | undefined;
  if (input.competitors && input.competitors.length) {
    const mainTopTerms = (onPage.keywordDensity || []).slice(0, 20).map((t)=>t.term);
    competitorSummaries = [];
    const overlaps: Array<{ competitor: string; overlap: number }> = [];
    for (const compUrl of input.competitors.slice(0,3)) {
      try {
        const compHtml = await fetchHtml(compUrl);
        if (!compHtml) continue;
        const parsed = parseHtml(compHtml, compUrl);
        const compTop = (parsed.onPage.keywordDensity || []).slice(0, 20).map((t)=>t.term);
        const inter = new Set(compTop.filter((t)=> mainTopTerms.includes(t)));
        const union = new Set([...compTop, ...mainTopTerms]);
        const overlapPct = union.size ? Math.round((inter.size / union.size) * 100) : 0;
        overlaps.push({ competitor: compUrl, overlap: overlapPct });
        competitorSummaries.push({ url: compUrl, topTerms: compTop, title: parsed.onPage.title });
      } catch {}
    }
    if (overlaps.length) {
      offPage.competitorKeywordOverlap = overlaps;
    }
  }
  const offPageScore = scoreOffPage(offPage);
  const pillars: PillarScores = {
    visibility: onPageScore,
    trust: Math.round((onPage.schemaPresent ? 10 : 0) + offPageScore * 0.9),
    relevance: Math.round(onPageScore * 0.8 + geoScore * 0.2),
  };
  const overallScore = Math.round((onPageScore * 0.55) + (geoScore * 0.25) + (offPageScore * 0.2));

  // Quick fixes derived from heuristics
  const fixes: string[] = [];
  if (onPage.titleLength < 35 || onPage.titleLength > 70) fixes.push('Optimize title length to 35–65 characters with primary keyword near the start');
  if (onPage.metaDescriptionLength < 120 || onPage.metaDescriptionLength > 170) fixes.push('Write a clear, benefit-driven meta description (120–160 characters)');
  if (onPage.h1Count !== 1) fixes.push('Ensure exactly one H1 and use H2/H3 for structure');
  if (onPage.wordCount < 600) fixes.push('Increase content depth to 800–1500 words covering subtopics and FAQs');
  if (onPage.imageCount && onPage.imagesWithAlt < onPage.imageCount) fixes.push('Add descriptive alt text to all key images');
  if (!onPage.schemaPresent) fixes.push('Add schema markup (Organization, WebPage, Breadcrumb)');
  if (onPage.internalLinks < 10) fixes.push('Add internal links to relevant pillar and cluster pages');

  const opportunities: string[] = [];
  if (!geo.language) opportunities.push('Set <html lang> and ensure language metadata is correct');
  if (!(geo.hreflangTags?.length)) opportunities.push('Add hreflang tags for multilingual or multi-region targeting');
  if (!(geo.localKeywords?.length)) opportunities.push('Include local city/region terms in headings and body content');

  return {
    url: input.url,
    computedAt: new Date().toISOString(),
    overallScore,
    pillars,
    onPage,
    geo,
    offPage,
    topQuickFixes: fixes.slice(0,3),
    missedOpportunities: opportunities.slice(0,3),
    ...(competitorSummaries ? { competitorSummaries } : {}),
  };
}
