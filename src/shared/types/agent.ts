export type AgentAccess = 'public' | 'premium';

export type AgentCategoryTag =
  | 'analytics'
  | 'growth'
  | 'operations'
  | 'biz'
  | 'vee'
  | 'miz'
  | 'riz'
  | 'fiz'
  | 'hiz';

export interface AgentCategoryDefinition {
  id: AgentCategoryTag;
  name: string;
  description: string;
}

export interface AgentRouteDefinition {
  agentId: string;
  canonicalPath: string;
  legacyPaths?: string[];
}

export interface AgentCategoryMapItem {
  agentId: string;
  categoryTags: AgentCategoryTag[];
  primaryCategoryTag: AgentCategoryTag;
}

export interface AgentModuleConfig {
  id: string;
  name: string;
  canonicalPath: string;
  access: AgentAccess;
  categoryTags: AgentCategoryTag[];
}
