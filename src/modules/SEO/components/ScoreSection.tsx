import React from 'react';
import { Info } from 'lucide-react';
import type { Section, SectionItem } from '../utils/buildScoreSections';

type Props = {
  section: Section;
  color: string; // 'blue' or 'cyan'
  score: number; // Overall score for the section
  onInfoClick?: () => void; // Callback to open definitions dialog
};

export const ScoreSection: React.FC<Props> = ({ section, color, score, onInfoClick }) => {
  const [expandAll, setExpandAll] = React.useState(false);

  const bgColor = color === 'blue' ? 'bg-blue-500' : 'bg-cyan-500';
  const parentColor = color === 'blue' ? '#3b82f6' : '#06b6d4'; // Blue-500 or Cyan-500
  const childColor = color === 'blue' ? '#60a5fa' : '#22d3ee';  // Blue-400 or Cyan-400 (lighter)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`${bgColor} text-white rounded-xl p-3 text-2xl font-black`}>
            {score}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{section.title}</h3>
              {onInfoClick && (
                <button
                  type="button"
                  onClick={onInfoClick}
                  className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  title="View KPI definitions"
                >
                  <Info className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Component breakdown & impact</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpandAll(!expandAll)}
          className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
        >
          {expandAll ? 'Collapse' : 'Expand All'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandAll ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>
      </div>

      {/* Hierarchical List */}
      <div className="space-y-4">
        {section.items.map((item, idx) => (
          <div key={item.id} className="space-y-2">
            {/* Parent Item - Prominent */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 w-5 mt-0.5">{idx + 1}</span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
                    {item.weight && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">weight: {Math.round(item.weight * 100)}%</span>
                    )}
                  </div>
                  <span className="text-lg font-bold" style={{ color: parentColor }}>{Math.round(item.score)}</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%`, backgroundColor: parentColor }}
                  />
                </div>
              </div>
            </div>

            {/* Child Items - Subtle, No Lines */}
            {expandAll && item.children && item.children.length > 0 && (
              <div className="ml-8 space-y-1.5 mt-3">
                {item.children.map((child, childIdx) => (
                  <div key={child.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">{idx + 1}.{childIdx + 1}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{child.label}</span>
                        {child.weight && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">weight: {Math.round(child.weight * 100)}%</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: childColor }}>{Math.round(child.score)}</span>
                    </div>
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${child.score}%`, backgroundColor: childColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreSection;
