import stem from 'wink-porter2-stemmer';

/** Normalize and stem a single word to its root form */
export function normalizeWord(word: string): string {
  const text = (word || '').toLowerCase();
  // Tokenize by alphanumeric segments to handle punctuation and multi-word phrases
  const tokens = text.match(/[a-z0-9]+/g) || [];
  return tokens.map(t => stem(t)).join(' ');
}

export type CompetitorKeywords = { domain: string; keywords: string[] };

/**
 * Compare site keywords and competitor keywords at the core level.
 * Returns per-domain overlap, competitorOnly, and siteOnly arrays.
 */
export function analyzeKeywordOverlap(
  siteKeywords: string[],
  competitors: CompetitorKeywords[],
): Record<string, { overlap: string[]; competitorOnly: string[]; siteOnly: string[] }> {
  const siteSet = new Set(siteKeywords.map(normalizeWord));

  const results: Record<string, { overlap: string[]; competitorOnly: string[]; siteOnly: string[] }> = {};

  for (const comp of competitors) {
    const compSet = new Set((comp.keywords || []).map(normalizeWord));
    const overlap = [...compSet].filter(w => siteSet.has(w));
    const competitorOnly = [...compSet].filter(w => !siteSet.has(w));
    const siteOnly = [...siteSet].filter(w => !compSet.has(w));
    results[comp.domain] = { overlap, competitorOnly, siteOnly };
  }

  return results;
}
