import type { AgentRouteDefinition } from '@/shared/types/agent';

export const AGENT_ROUTE_DEFINITIONS: AgentRouteDefinition[] = [
  {
    agentId: 'bi-agent',
    canonicalPath: '/agents/biz',
    legacyPaths: ['/biz'],
  },
  {
    agentId: 'seo-geo-agent',
    canonicalPath: '/agents/seo-geo',
    legacyPaths: ['/vee/seo-geo', '/seo', '/seo-geo-ai-tool', '/mia/seo-geo'],
  },
  {
    agentId: 'reddit-geo-agent',
    canonicalPath: '/agents/reddit-geo',
    legacyPaths: [
      '/reddit-geo-agent',
      '/vee/reddit-copilot',
      '/mia/reddit-copilot',
      '/vee/reddit-copilot/client-setup',
      '/vee/reddit-copilot/agent-control',
      '/vee/reddit-copilot/settings',
      '/mia/reddit-copilot/client-setup',
      '/mia/reddit-copilot/agent-control',
      '/mia/reddit-copilot/settings',
    ],
  },
  {
    agentId: 'keyword-trend',
    canonicalPath: '/agents/keyword-discovery',
    legacyPaths: ['/vee/keyword-agent', '/vee/keyword-trend', '/mia/keyword-trend'],
  },
  {
    agentId: 'trend-analysis',
    canonicalPath: '/agents/trend-analysis',
    legacyPaths: ['/vee/trend-agent'],
  },
  {
    agentId: 'mia-core',
    canonicalPath: '/agents/mia-core',
    legacyPaths: ['/mia', '/MIA'],
  },
  {
    agentId: 'creative-labs',
    canonicalPath: '/agents/creative-labs',
    legacyPaths: ['/mia/creative'],
  },
  {
    agentId: 'brandlenz',
    canonicalPath: '/agents/brandlenz',
    legacyPaths: ['/mia/brandlenz', '/brandlenz'],
  },
  {
    agentId: 'dufa',
    canonicalPath: '/agents/dufa',
    legacyPaths: ['/dufa', '/riz', '/riz/dufa'],
  },
  {
    agentId: 'inventory-insight',
    canonicalPath: '/agents/inventory-insight',
    legacyPaths: ['/riz/inventory'],
  },
];
