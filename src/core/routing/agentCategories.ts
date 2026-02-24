import type { AgentCategoryDefinition, AgentCategoryTag } from '@/shared/types/agent';

export const AGENT_CATEGORIES: AgentCategoryDefinition[] = [
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Intelligence agents that transform data into actionable insights—BIZ, MIA, and DUFA.',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Visibility and expansion agents—Reddit GEO, SEO-GEO, and Keyword & Trend intelligence.',
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Operational efficiency agents—IIA and DUFA for inventory and demand optimization.',
  },
  {
    id: 'biz',
    name: 'Business Intelligence Zone',
    description: 'Data and analytics products that convert data into decisions.',
  },
  {
    id: 'vee',
    name: 'Visibility Enhancement Engine',
    description: 'Search, GEO, trend, and channel visibility intelligence products.',
  },
  {
    id: 'miz',
    name: 'Marketing Intelligence Zone',
    description: 'Marketing strategy, creative, and brand intelligence products.',
  },
  {
    id: 'riz',
    name: 'Retail Intelligence Zone',
    description: 'Retail demand, inventory, and operations intelligence products.',
  },
  {
    id: 'fiz',
    name: 'Financial Intelligence Zone',
    description: 'Financial forecasting and insights products (planned).',
  },
  {
    id: 'hiz',
    name: 'Healthcare Intelligence Zone',
    description: 'Healthcare analytics and intelligence products (planned).',
  },
];

export const AGENT_CATEGORY_BY_ID = AGENT_CATEGORIES.reduce<Record<AgentCategoryTag, AgentCategoryDefinition>>(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<AgentCategoryTag, AgentCategoryDefinition>
);
