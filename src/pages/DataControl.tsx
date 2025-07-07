import React, { useState, useEffect } from 'react';
import CsvXlsxUploader from '@/components/CsvXlsxUploader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SchemaEditor from '@/components/SchemaEditor';
import { TableSchema } from './TableExplorer';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface KPI {
  id: string;
  name: string;
  definition: string;
  formula: string;
  sampleQuery: string;
}

const DataControl = () => {
  const { user } = useAuth();
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [schemas, setSchemas] = useState<Record<string, TableSchema>>({});
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [showKpiForm, setShowKpiForm] = useState(false);
  const [formKpi, setFormKpi] = useState<KPI>({ id: '', name: '', definition: '', formula: '', sampleQuery: '' });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSave = async () => {
    try {
      const payload = {
        email: user?.email,
        tables: Object.entries(schemas).map(([table, schema]) => ({
          table,
          columns: schema.columns.map((col) => ({
            name: col.name,
            description: col.description || "",
          })),
        })),
      };

      const res = await fetch('https://viz-update-schema-description-286070583332.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("Update success:", json);
      toast.success("Schema descriptions saved successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to save schema descriptions.");
    }
  };

  const fetchRealSchema = async (email: string) => {
    setLoadingSchema(true);
    try {
      const response = await fetch('https://viz-fetch-schema-286070583332.us-central1.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const schemaList = await response.json();
      if (!response.ok) throw new Error(schemaList.error || 'Failed to fetch schema');

      const updatedSchemas: Record<string, TableSchema> = {};
      const tableList: { id: string; name: string }[] = [];

      if (!Array.isArray(schemaList.tables)) {
        throw new Error('Invalid schema format received from backend.');
      }

      for (const item of schemaList.tables) {
        updatedSchemas[item.table_name] = {
          tableId: item.table_name,
          columns: item.columns.map((col: any) => ({
            name: col.name,
            dataType: col.type,
            description: col.description || '',
            enumValues: col.enums || [],
            isRequired: col.mode === 'REQUIRED',
            mode: col.mode
          }))
        };
        tableList.push({ id: item.table_name, name: item.table_name });
      }

      setSchemas(updatedSchemas);
      setSelectedTableId(tableList[0]?.id || '');
    } catch (err: any) {
      console.error("Schema fetch failed:", err);
      toast.error(`❌ Failed to fetch schema: ${err.message}`);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleSchemaChange = (updatedSchema: TableSchema) => {
    setSchemas((prev) => ({ ...prev, [updatedSchema.tableId]: updatedSchema }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue="connections"
          className="space-y-6"
          onValueChange={(val) => {
            if (val === 'schema' && user?.email) {
              fetchRealSchema(user.email);
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 mb-6">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="schema">Schema Management</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className={`rounded-lg border p-6 flex flex-col items-center justify-center relative transition bg-white dark:bg-viz-medium shadow-md ${uploadSuccess ? 'border-green-500 ring-2 ring-green-300' : ''}`}
              >
                {uploadSuccess && (
                  <div className="absolute top-2 right-2 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <h3 className="font-semibold mb-2 text-lg">CSV / XLSX Upload</h3>
                <p className="text-sm text-viz-text-secondary mb-4">Upload your data files</p>

                <CsvXlsxUploader
                  onFileUpload={(file, msg) => {
                    setUploadSuccess(true);
                    setTimeout(() => setUploadSuccess(false), 4000);
                    if (user?.email) fetchRealSchema(user.email);
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-6">
            <div className="rounded-lg border p-6 bg-white dark:bg-viz-medium shadow-md">
              <h3 className="font-semibold mb-2 text-lg">Schema Management</h3>
              <p className="text-sm text-viz-text-secondary mb-4">
                View and edit your tables, columns, data types, and descriptions. Edit enum values as needed.
              </p>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <div className="font-semibold mb-2">Tables</div>
                  <ul className="space-y-2">
                    {Object.keys(schemas).map((tableId) => (
                      <li key={tableId}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${selectedTableId === tableId ? 'bg-viz-accent text-white' : 'bg-viz-light/30 dark:bg-viz-dark/30 text-viz-dark dark:text-white hover:bg-viz-accent/20'}`}
                          title={tableId}
                          onClick={() => setSelectedTableId(tableId)}
                        >
                          <span className="block truncate">{tableId}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:w-3/4">
                  {loadingSchema ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-viz-accent border-t-transparent" />
                    </div>
                  ) : Object.keys(schemas).length === 0 ? (
                    <div className="text-center text-viz-text-secondary p-6">
                      No tables found. Please upload a file from the <strong>Connections</strong> tab first.
                    </div>
                  ) : schemas[selectedTableId] ? (
                    <SchemaEditor
                      schema={schemas[selectedTableId]}
                      onChange={handleSchemaChange}
                      onSave={handleSave}
                    />
                  ) : (
                    <div className="text-sm text-viz-text-secondary p-4">
                      Select a table to view its schema.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            {/* KPI logic would go here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataControl;
