import React from 'react';
import CsvXlsxUploader from '@/components/CsvXlsxUploader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SchemaEditor from '@/components/SchemaEditor';
import { TableSchema, Column } from './TableExplorer';
import { useState } from 'react';
import Header from '@/components/Header';

const mockTables: { id: string; name: string }[] = [
  { id: 'orders', name: 'Orders' },
  { id: 'customers', name: 'Customers' },
  { id: 'products', name: 'Products' },
];
const mockSchemas: Record<string, TableSchema> = {
  orders: {
    tableId: 'orders',
    columns: [
      { name: 'order_id', dataType: 'STRING', description: 'Unique order identifier', isRequired: true, mode: 'REQUIRED' },
      { name: 'customer_id', dataType: 'STRING', description: 'Customer identifier', isRequired: true, mode: 'REQUIRED' },
      { name: 'order_date', dataType: 'TIMESTAMP', description: 'Date when order was placed', isRequired: true, mode: 'REQUIRED' },
      { name: 'status', dataType: 'STRING', description: 'Order status', enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], isRequired: true, mode: 'REQUIRED' },
      { name: 'total_amount', dataType: 'NUMERIC', description: 'Total order amount', isRequired: true, mode: 'REQUIRED' },
    ]
  },
  customers: {
    tableId: 'customers',
    columns: [
      { name: 'customer_id', dataType: 'STRING', description: 'Unique customer identifier', isRequired: true, mode: 'REQUIRED' },
      { name: 'email', dataType: 'STRING', description: 'Customer email address', isRequired: true, mode: 'REQUIRED' },
      { name: 'first_name', dataType: 'STRING', description: 'Customer first name', isRequired: false, mode: 'NULLABLE' },
      { name: 'last_name', dataType: 'STRING', description: 'Customer last name', isRequired: false, mode: 'NULLABLE' },
      { name: 'created_at', dataType: 'TIMESTAMP', description: 'Account creation timestamp', isRequired: true, mode: 'REQUIRED' },
    ]
  },
  products: {
    tableId: 'products',
    columns: [
      { name: 'product_id', dataType: 'STRING', description: 'Product ID', isRequired: true, mode: 'REQUIRED' },
      { name: 'name', dataType: 'STRING', description: 'Product name', isRequired: true, mode: 'REQUIRED' },
      { name: 'category', dataType: 'STRING', description: 'Product category', isRequired: false, mode: 'NULLABLE' },
      { name: 'price', dataType: 'NUMERIC', description: 'Product price', isRequired: true, mode: 'REQUIRED' },
      { name: 'in_stock', dataType: 'BOOLEAN', description: 'Is in stock', isRequired: true, mode: 'REQUIRED' },
    ]
  },
};

interface KPI {
  id: string;
  name: string;
  definition: string;
  formula: string;
  sampleQuery: string;
}

const DataControl = () => {
  const [selectedTableId, setSelectedTableId] = useState<string>(mockTables[0].id);
  const [schemas, setSchemas] = useState<Record<string, TableSchema>>(mockSchemas);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [showKpiForm, setShowKpiForm] = useState(false);
  const [formKpi, setFormKpi] = useState<KPI>({ id: '', name: '', definition: '', formula: '', sampleQuery: '' });

  const handleSchemaChange = (updatedSchema: TableSchema) => {
    setSchemas((prev) => ({ ...prev, [updatedSchema.tableId]: updatedSchema }));
  };

  const handleAddKpi = () => {
    setFormKpi({ id: '', name: '', definition: '', formula: '', sampleQuery: '' });
    setEditingKpi(null);
    setShowKpiForm(true);
  };

  const handleEditKpi = (kpi: KPI) => {
    setFormKpi(kpi);
    setEditingKpi(kpi);
    setShowKpiForm(true);
  };

  const handleDeleteKpi = (id: string) => {
    setKpis((prev) => prev.filter((k) => k.id !== id));
  };

  const handleKpiFormChange = (field: keyof KPI, value: string) => {
    setFormKpi((prev) => ({ ...prev, [field]: value }));
  };

  const handleKpiFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKpi.name.trim()) return;
    if (editingKpi) {
      setKpis((prev) => prev.map((k) => (k.id === editingKpi.id ? { ...formKpi, id: editingKpi.id } : k)));
    } else {
      setKpis((prev) => [
        ...prev,
        { ...formKpi, id: Date.now().toString() },
      ]);
    }
    setShowKpiForm(false);
    setEditingKpi(null);
    setFormKpi({ id: '', name: '', definition: '', formula: '', sampleQuery: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-viz-dark dark:text-white mb-2">Data Control Center</h1>
          <p className="text-viz-text-secondary">Manage your data connections, schema, and KPIs</p>
        </div>
        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 mb-6">
            <TabsTrigger value="connections" className="flex items-center gap-2">Connections</TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">Schema Management</TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">KPIs</TabsTrigger>
          </TabsList>
          {/* Data Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg border p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium shadow-md">
                <h3 className="font-semibold mb-2 text-lg">CSV / XLSX Upload</h3>
                <p className="text-sm text-viz-text-secondary mb-4">Upload your data files</p>
                <CsvXlsxUploader onFileUpload={(file) => {
                  // TODO: handle file upload logic
                  alert(`File uploaded: ${file.name}`);
                }} />
              </div>
              <div className="rounded-lg border p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium opacity-60 cursor-not-allowed shadow-md">
                <h3 className="font-semibold mb-2 text-lg">BigQuery</h3>
                <p className="text-sm text-viz-text-secondary mb-4">Connect to Google BigQuery</p>
                <span className="viz-badge-warning">WIP</span>
              </div>
              <div className="rounded-lg border p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium opacity-60 cursor-not-allowed shadow-md">
                <h3 className="font-semibold mb-2 text-lg">Redshift</h3>
                <p className="text-sm text-viz-text-secondary mb-4">Connect to Amazon Redshift</p>
                <span className="viz-badge-warning">WIP</span>
              </div>
              <div className="rounded-lg border p-6 flex flex-col items-center justify-center bg-white dark:bg-viz-medium opacity-60 cursor-not-allowed shadow-md">
                <h3 className="font-semibold mb-2 text-lg">MySQL</h3>
                <p className="text-sm text-viz-text-secondary mb-4">Connect to MySQL</p>
                <span className="viz-badge-warning">WIP</span>
              </div>
              {/* Add more connectors as needed */}
            </div>
          </TabsContent>
          {/* Schema Management Tab */}
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
                    {mockTables.map((table) => (
                      <li key={table.id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${selectedTableId === table.id ? 'bg-viz-accent text-white' : 'bg-viz-light/30 dark:bg-viz-dark/30 text-viz-dark dark:text-white hover:bg-viz-accent/20'}`}
                          onClick={() => setSelectedTableId(table.id)}
                        >
                          {table.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-3/4">
                  <SchemaEditor
                    schema={schemas[selectedTableId]}
                    onChange={handleSchemaChange}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          {/* KPI Tab */}
          <TabsContent value="kpis" className="space-y-6">
            <div className="rounded-lg border p-6 bg-white dark:bg-viz-medium shadow-md">
              <h3 className="font-semibold mb-2 text-lg">KPIs</h3>
              <p className="text-sm text-viz-text-secondary mb-4">
                Define and manage your key performance indicators (KPIs) with name, definition, formula, and sample query.
              </p>
              <div className="flex flex-col gap-6">
                <div className="flex justify-end">
                  <button className="viz-button-primary" onClick={handleAddKpi}>+ Add KPI</button>
                </div>
                {kpis.length === 0 && (
                  <div className="text-center text-viz-text-secondary py-8">No KPIs defined yet.</div>
                )}
                {kpis.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-viz-light/30 dark:bg-viz-dark/30">
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Definition</th>
                          <th className="p-2 text-left">Formula</th>
                          <th className="p-2 text-left">Sample Query</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpis.map((kpi) => (
                          <tr key={kpi.id} className="border-t">
                            <td className="p-2 font-semibold">{kpi.name}</td>
                            <td className="p-2">{kpi.definition}</td>
                            <td className="p-2 font-mono text-xs">{kpi.formula}</td>
                            <td className="p-2 font-mono text-xs">{kpi.sampleQuery}</td>
                            <td className="p-2 flex gap-2">
                              <button className="viz-button-secondary" onClick={() => handleEditKpi(kpi)}>Edit</button>
                              <button className="viz-button-danger" onClick={() => handleDeleteKpi(kpi.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {showKpiForm && (
                  <form onSubmit={handleKpiFormSubmit} className="bg-viz-light/10 dark:bg-viz-dark/10 rounded-lg p-6 flex flex-col gap-4 max-w-2xl mx-auto">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold">KPI Name</label>
                      <input
                        className="viz-input"
                        value={formKpi.name}
                        onChange={e => handleKpiFormChange('name', e.target.value)}
                        required
                        placeholder="e.g. Conversion Rate"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold">Definition</label>
                      <textarea
                        className="viz-input"
                        value={formKpi.definition}
                        onChange={e => handleKpiFormChange('definition', e.target.value)}
                        placeholder="Describe what this KPI measures..."
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold">Formula</label>
                      <input
                        className="viz-input font-mono"
                        value={formKpi.formula}
                        onChange={e => handleKpiFormChange('formula', e.target.value)}
                        placeholder="e.g. (Total Orders / Total Visitors) * 100"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold">Sample Query</label>
                      <textarea
                        className="viz-input font-mono"
                        value={formKpi.sampleQuery}
                        onChange={e => handleKpiFormChange('sampleQuery', e.target.value)}
                        placeholder="Provide a sample SQL query for this KPI..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="viz-button-secondary" onClick={() => setShowKpiForm(false)}>Cancel</button>
                      <button type="submit" className="viz-button-primary">{editingKpi ? 'Update KPI' : 'Add KPI'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataControl;
