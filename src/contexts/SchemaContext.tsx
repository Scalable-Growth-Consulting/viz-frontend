import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

export interface SchemaContextType {
  hasTables: boolean;
  setHasTables: (val: boolean) => void;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export const useSchema = (): SchemaContextType => {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error('useSchema must be used within a SchemaProvider');
  return ctx;
};

export const SchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasTables, setHasTablesState] = useState<boolean>(false);

  // Initialize from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('viz_has_tables');
      if (raw === 'true') setHasTablesState(true);
      if (raw === 'false') setHasTablesState(false);
    } catch {}
  }, []);

  // Setter that also persists
  const setHasTables = useCallback((val: boolean) => {
    setHasTablesState(val);
    try { localStorage.setItem('viz_has_tables', String(val)); } catch {}
  }, []);

  const value = useMemo(() => ({ hasTables, setHasTables }), [hasTables, setHasTables]);

  return (
    <SchemaContext.Provider value={value}>
      {children}
    </SchemaContext.Provider>
  );
};
