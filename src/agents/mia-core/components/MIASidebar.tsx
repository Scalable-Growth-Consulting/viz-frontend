import React from 'react';
import { LayoutDashboard, TrendingUp, Settings, MessageSquare, Database, Zap, BarChart3 } from 'lucide-react';
import { AgentSidebar, SidebarSection } from '@/components/shared/AgentSidebar';

interface MIASidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const MIASidebar: React.FC<MIASidebarProps> = ({
  activeView,
  onViewChange,
}) => {
  const sections: SidebarSection[] = [
    {
      title: 'Intelligence',
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'campaigns',
          label: 'Campaigns',
          icon: TrendingUp,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
        },
        {
          id: 'insights',
          label: 'AI Insights',
          icon: Zap,
        },
        {
          id: 'chat',
          label: 'AI Assistant',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          id: 'integrations',
          label: 'Integrations',
          icon: Database,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
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

export default MIASidebar;
