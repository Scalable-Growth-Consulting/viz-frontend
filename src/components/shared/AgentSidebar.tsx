import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  onClick?: () => void;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface AgentSidebarProps {
  sections: SidebarSection[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  defaultCollapsed?: boolean;
  className?: string;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  sections,
  activeItem,
  onItemClick,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  return (
    <div
      className={cn(
        'relative h-full bg-white dark:bg-viz-dark border-r border-slate-200 dark:border-viz-light/10 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-slate-200 dark:border-viz-light/10 bg-white dark:bg-viz-dark shadow-sm hover:shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            {section.title && !isCollapsed && (
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-viz-accent text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-viz-light/10',
                      isCollapsed && 'justify-center'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-white')} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-semibold rounded-full',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 dark:bg-viz-light/20 text-slate-700 dark:text-slate-300'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer (optional) */}
      {!isCollapsed && (
        <div className="border-t border-slate-200 dark:border-viz-light/10 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Powered by VIZ AI
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentSidebar;
