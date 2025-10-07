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
  // Simple English stopword list (aligns with seoAnalyzer.ts)
  const STOPWORDS = new Set<string>([
    'the','and','is','to','in','of','a','for','on','with','this','that','by','as','from','it','at','be','or','an','are','we','you','your','our','us','their','they','he','she','them','its','but','if','will','can','about','more','all','not','out','up','so','what','when','how','why'
  ]);
  // Tokenize a phrase into words (preserve original casing for display)
  const tokenize = (phrase: string): string[] => {
    const text = String(phrase || '');
    return text.match(/[A-Za-z0-9]+/g) || [];
  };

  // Build map: stem -> set of original FULL tokens (words)
  const buildStemMapFromPhrases = (phrases: string[]) => {
    const map = new Map<string, Set<string>>();
    for (const raw of phrases || []) {
      const words = tokenize(raw);
      for (const w of words) {
        if (!w || w.length <= 2) continue; // drop tiny words
        if (STOPWORDS.has(w.toLowerCase())) continue; // drop stopwords
        const k = stem(w.toLowerCase());
        if (!k) continue;
        if (!map.has(k)) map.set(k, new Set<string>());
        map.get(k)!.add(w);
      }
    }
    return map;
  };

  const chooseRepresentative = (...sets: Array<Set<string> | undefined>): string => {
    const candidates: string[] = [];
    for (const s of sets) if (s) candidates.push(...Array.from(s));
    if (candidates.length === 0) return '';
    // Prefer the longest token, then alphabetical for stability
    candidates.sort((a, b) => b.length - a.length || a.localeCompare(b));
    const seen = new Set<string>();
    for (const c of candidates) {
      const v = c.trim();
      if (v && !seen.has(v)) return v;
    }
    return candidates[0];
  };

  const siteMap = buildStemMapFromPhrases(siteKeywords);

  const results: Record<string, { overlap: string[]; competitorOnly: string[]; siteOnly: string[] }> = {};

  for (const comp of competitors) {
    const compMap = buildStemMapFromPhrases(comp.keywords || []);
    const compKeys = new Set(compMap.keys());
    const siteKeys = new Set(siteMap.keys());

    const overlapKeys = Array.from(compKeys).filter((k) => siteKeys.has(k));
    const competitorOnlyKeys = Array.from(compKeys).filter((k) => !siteKeys.has(k));
    const siteOnlyKeys = Array.from(siteKeys).filter((k) => !compKeys.has(k));

    const overlap = overlapKeys
      .map((k) => chooseRepresentative(compMap.get(k), siteMap.get(k)))
      .filter(Boolean);
    const competitorOnly = competitorOnlyKeys
      .map((k) => chooseRepresentative(compMap.get(k)))
      .filter(Boolean);
    const siteOnly = siteOnlyKeys
      .map((k) => chooseRepresentative(siteMap.get(k)))
      .filter(Boolean);

    const uniq = (arr: string[]) => Array.from(new Set(arr));
    results[comp.domain] = {
      overlap: uniq(overlap),
      competitorOnly: uniq(competitorOnly),
      siteOnly: uniq(siteOnly),
    };
  }

  return results;
}
