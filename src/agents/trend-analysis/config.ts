import type { AgentModuleConfig } from '@/shared/types/agent';

export const TREND_ANALYSIS_CONFIG: AgentModuleConfig = {
  id: 'trend-analysis',
  name: 'Trend Analysis Agent',
  canonicalPath: '/agents/trend-analysis',
  access: 'public',
  categoryTags: ['growth', 'vee', 'miz'],
};
