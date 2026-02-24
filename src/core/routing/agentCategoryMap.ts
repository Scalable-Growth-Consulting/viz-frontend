import type { AgentCategoryMapItem } from '@/shared/types/agent';

export const AGENT_CATEGORY_MAP: AgentCategoryMapItem[] = [
  {
    agentId: 'bi-agent',
    categoryTags: ['analytics', 'biz'],
    primaryCategoryTag: 'analytics',
  },
  {
    agentId: 'mia-core',
    categoryTags: ['analytics', 'miz'],
    primaryCategoryTag: 'analytics',
  },
  {
    agentId: 'dufa',
    categoryTags: ['analytics', 'operations', 'riz'],
    primaryCategoryTag: 'analytics',
  },
  {
    agentId: 'seo-geo-agent',
    categoryTags: ['growth', 'vee'],
    primaryCategoryTag: 'growth',
  },
  {
    agentId: 'reddit-geo-agent',
    categoryTags: ['growth', 'vee'],
    primaryCategoryTag: 'growth',
  },
  {
    agentId: 'keyword-trend',
    categoryTags: ['growth', 'vee'],
    primaryCategoryTag: 'growth',
  },
  {
    agentId: 'trend-analysis',
    categoryTags: ['growth', 'vee'],
    primaryCategoryTag: 'growth',
  },
  {
    agentId: 'inventory-insight',
    categoryTags: ['operations', 'riz'],
    primaryCategoryTag: 'operations',
  },
  {
    agentId: 'creative-labs',
    categoryTags: ['miz'],
    primaryCategoryTag: 'miz',
  },
  {
    agentId: 'brandlenz',
    categoryTags: ['miz'],
    primaryCategoryTag: 'miz',
  },
];

export const AGENT_CATEGORY_TAGS_BY_ID = AGENT_CATEGORY_MAP.reduce<Record<string, AgentCategoryMapItem>>(
  (acc, item) => {
    acc[item.agentId] = item;
    return acc;
  },
  {}
);
