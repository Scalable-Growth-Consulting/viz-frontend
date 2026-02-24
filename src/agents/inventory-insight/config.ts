import type { AgentModuleConfig } from '@/shared/types/agent';

export const INVENTORY_INSIGHT_CONFIG: AgentModuleConfig = {
  id: 'inventory-insight',
  name: 'Inventory Insight Agent',
  canonicalPath: '/agents/inventory-insight',
  access: 'premium',
  categoryTags: ['operations', 'riz'],
};
