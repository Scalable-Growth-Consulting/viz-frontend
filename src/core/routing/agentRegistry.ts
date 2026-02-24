import type { AgentModuleConfig } from '@/shared/types/agent';
import { BIZ_CONFIG } from '@/agents/biz/config';
import { SEO_GEO_CONFIG } from '@/agents/seo-geo/config';
import { REDDIT_GEO_CONFIG } from '@/agents/reddit-geo/config';
import { KEYWORD_DISCOVERY_CONFIG } from '@/agents/keyword-discovery/config';
import { TREND_ANALYSIS_CONFIG } from '@/agents/trend-analysis/config';
import { MIA_CORE_CONFIG } from '@/agents/mia-core/config';
import { CREATIVE_LABS_CONFIG } from '@/agents/creative-labs/config';
import { BRANDLENZ_CONFIG } from '@/agents/brandlenz/config';
import { DUFA_CONFIG } from '@/agents/dufa/config';
import { INVENTORY_INSIGHT_CONFIG } from '@/agents/inventory-insight/config';

export const AGENT_REGISTRY: AgentModuleConfig[] = [
  BIZ_CONFIG,
  SEO_GEO_CONFIG,
  REDDIT_GEO_CONFIG,
  KEYWORD_DISCOVERY_CONFIG,
  TREND_ANALYSIS_CONFIG,
  MIA_CORE_CONFIG,
  CREATIVE_LABS_CONFIG,
  BRANDLENZ_CONFIG,
  DUFA_CONFIG,
  INVENTORY_INSIGHT_CONFIG,
];

export const AGENT_REGISTRY_BY_ID = AGENT_REGISTRY.reduce<Record<string, AgentModuleConfig>>(
  (acc, config) => {
    acc[config.id] = config;
    return acc;
  },
  {}
);

export const AGENT_REGISTRY_BY_PATH = AGENT_REGISTRY.reduce<Record<string, AgentModuleConfig>>(
  (acc, config) => {
    acc[config.canonicalPath] = config;
    return acc;
  },
  {}
);
