
import React from 'react';
import { Table } from '../pages/TableExplorer';
import { DatabaseIcon, ClockIcon } from 'lucide-react';

interface TableListProps {
  tables: Table[];
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
}

const TableList: React.FC<TableListProps> = ({ tables, selectedTable, onTableSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-2">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 border ${
            selectedTable?.id === table.id
              ? 'bg-viz-accent/10 border-viz-accent/30 dark:bg-viz-accent/20'
              : 'hover:bg-slate-50 dark:hover:bg-viz-light/10 border-transparent'
          }`}
          onClick={() => onTableSelect(table)}
        >
          <div className="flex items-start gap-3">
            <DatabaseIcon className="w-4 h-4 text-viz-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 dark:text-white truncate">
                {table.name}
              </h3>
              {table.description && (
                <p className="text-xs text-slate-600 dark:text-viz-text-secondary mt-1 line-clamp-2">
                  {table.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-viz-text-secondary">
                <ClockIcon className="w-3 h-3" />
                <span>{formatDate(table.lastModified)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableList;
