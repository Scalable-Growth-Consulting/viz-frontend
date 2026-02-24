import type { AgentModuleConfig } from '@/shared/types/agent';

export const REDDIT_GEO_CONFIG: AgentModuleConfig = {
  id: 'reddit-geo-agent',
  name: 'Reddit GEO Agent',
  canonicalPath: '/agents/reddit-geo',
  access: 'public',
  categoryTags: ['growth', 'vee', 'miz'],
};
