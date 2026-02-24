import React from 'react';
import { LayoutDashboard, Search, FileText, Link2, Sparkles, CheckCircle, Settings, Save, Clock } from 'lucide-react';
import { AgentSidebar, SidebarSection } from '@/components/shared/AgentSidebar';

interface SEOSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  savedReportsCount?: number;
}

export const SEOSidebar: React.FC<SEOSidebarProps> = ({
  activeView,
  onViewChange,
  savedReportsCount = 0,
}) => {
  const sections: SidebarSection[] = [
    {
      title: 'Analysis Tools',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
        },
        {
          id: 'technical',
          label: 'Technical SEO',
          icon: Settings,
        },
        {
          id: 'content',
          label: 'Content Analysis',
          icon: FileText,
        },
        {
          id: 'backlinks',
          label: 'Backlinks',
          icon: Link2,
        },
        {
          id: 'geo',
          label: 'GEO Optimization',
          icon: Sparkles,
        },
        {
          id: 'recommendations',
          label: 'Recommendations',
          icon: CheckCircle,
        },
      ],
    },
    {
      title: 'Workspace',
      items: [
        {
          id: 'saved',
          label: 'Saved Reports',
          icon: Save,
          badge: savedReportsCount > 0 ? savedReportsCount : undefined,
        },
        {
          id: 'history',
          label: 'Recent Analyses',
          icon: Clock,
        },
      ],
    },
  ];

  return (
    <AgentSidebar
      sections={sections}
      activeItem={activeView}
      onItemClick={onViewChange}
      defaultCollapsed={false}
    />
  );
};

export default SEOSidebar;
