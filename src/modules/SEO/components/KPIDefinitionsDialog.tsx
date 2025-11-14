import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calculator } from 'lucide-react';
import type { KPIDefinition } from '../utils/kpiDefinitions';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  definitions: KPIDefinition[];
};

export const KPIDefinitionsDialog: React.FC<Props> = ({
  open,
  onClose,
  title,
  subtitle,
  definitions,
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'High Impact':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Medium Impact':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Low Impact':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(85vh-120px)]">
          <div className="p-6 space-y-6">
            {definitions.map((def, index) => (
              <div
                key={def.id}
                className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-0"
              >
                {/* KPI Header */}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {def.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                      Weight: {def.weight}%
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getImpactColor(def.impact)}`}>
                      {def.impact}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {def.description}
                </p>

                {/* Formula */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Calculation Formula
                    </span>
                  </div>
                  <code className="text-xs text-slate-700 dark:text-slate-300 font-mono block whitespace-pre-wrap break-words">
                    {def.formula}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default KPIDefinitionsDialog;
