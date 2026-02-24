import React from 'react';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { AGENT_LIST } from '@/data/agents';
import { AGENT_CATEGORIES } from '@/core/routing/agentCategories';
import { AGENT_CATEGORY_MAP } from '@/core/routing/agentCategoryMap';

const AgentCategoryMap: React.FC = () => {
  const categoryLabelById = AGENT_CATEGORIES.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {});

  const rows = AGENT_CATEGORY_MAP.map((mapping) => {
    const agent = AGENT_LIST.find((item) => item.id === mapping.agentId);
    return {
      id: mapping.agentId,
      name: agent?.name ?? mapping.agentId,
      route: agent?.route ?? 'N/A',
      primaryCategory: categoryLabelById[mapping.primaryCategoryTag] ?? mapping.primaryCategoryTag,
      allCategories: mapping.categoryTags
        .map((tag) => categoryLabelById[tag] ?? tag)
        .join(', '),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      <TopNav zone="home" showData={false} />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-viz-accent font-semibold">Agent Taxonomy</p>
          <h1 className="text-3xl font-bold text-viz-dark dark:text-white">Agent to Category Tag Mapping</h1>
          <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
            Canonical mapping used for route planning, discovery indexing, and marketplace categorization.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-viz-light/20 bg-white/90 dark:bg-viz-medium/80 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-viz-dark/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Agent</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Canonical Route</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Primary Category</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">All Category Tags</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200/70 dark:border-viz-light/10">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-100 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.route}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.primaryCategory}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.allCategories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
};

export default AgentCategoryMap;
