import type { AgentModuleConfig } from '@/shared/types/agent';

export const BIZ_CONFIG: AgentModuleConfig = {
  id: 'bi-agent',
  name: 'Business Intelligence Agent',
  canonicalPath: '/agents/biz',
  access: 'public',
  categoryTags: ['analytics', 'biz'],
};
