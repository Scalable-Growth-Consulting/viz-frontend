
import React, { useState } from 'react';
import Header from '../components/Header';
import { DatabaseIcon, BarChartIcon, PlusIcon, SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DataControl = () => {
  const [jsonSchema, setJsonSchema] = useState('');
  const [kpiName, setKpiName] = useState('');
  const [kpiDescription, setKpiDescription] = useState('');
  const [kpiFormula, setKpiFormula] = useState('');

  const handleSchemaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be sent to a backend
    alert('Schema submitted successfully');
  };

  const handleKpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be sent to a backend
    alert('KPI added successfully');
    setKpiName('');
    setKpiDescription('');
    setKpiFormula('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-viz-dark">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <DatabaseIcon className="w-4 h-4" />
              <span>Data Connections</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center space-x-2">
              <BarChartIcon className="w-4 h-4" />
              <span>Custom KPIs</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="data">
            <div className="viz-card p-6">
              <h2 className="text-xl font-semibold mb-6">Connect Data Source</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Connectors</h3>
                  <div className="space-y-4">
                    {['CSV Upload', 'BigQuery', 'Snowflake', 'PostgreSQL', 'MySQL', 'Excel'].map((connector, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-slate-200 dark:border-viz-light bg-white dark:bg-viz-medium hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                        <span>{connector}</span>
                        <PlusIcon className="w-5 h-5 text-viz-accent" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Schema Definition</h3>
                  <form onSubmit={handleSchemaSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Paste JSON Schema or Table Structure
                      </label>
                      <Textarea 
                        value={jsonSchema}
                        onChange={(e) => setJsonSchema(e.target.value)}
                        placeholder='{\n  "tables": [\n    {\n      "name": "orders",\n      "columns": ["id", "date", "customer_id", "amount"]\n    }\n  ]\n}'
                        className="min-h-[300px] font-mono"
                      />
                    </div>
                    <Button type="submit" className="bg-viz-accent hover:bg-viz-accent-light w-full">
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Save Schema
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="kpis">
            <div className="viz-card p-6">
              <h2 className="text-xl font-semibold mb-6">Custom KPI Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Add New KPI</h3>
                  <form onSubmit={handleKpiSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">KPI Name</label>
                      <Input 
                        value={kpiName}
                        onChange={(e) => setKpiName(e.target.value)}
                        placeholder="e.g., Customer Acquisition Cost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        value={kpiDescription}
                        onChange={(e) => setKpiDescription(e.target.value)}
                        placeholder="Explain what this KPI measures and why it's important"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Formula or Calculation</label>
                      <Input 
                        value={kpiFormula}
                        onChange={(e) => setKpiFormula(e.target.value)}
                        placeholder="e.g., Marketing Spend / New Customers"
                      />
                    </div>
                    <Button type="submit" className="bg-viz-accent hover:bg-viz-accent-light w-full">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add KPI
                    </Button>
                  </form>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Existing KPIs</h3>
                  <div className="space-y-4">
                    {[
                      {name: 'Gross Merchandise Value (GMV)', desc: 'Total value of merchandise sold'},
                      {name: 'Customer Lifetime Value (CLV)', desc: 'Total revenue expected from a customer'},
                      {name: 'Monthly Active Users (MAU)', desc: 'Unique users active in the last 30 days'}
                    ].map((kpi, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-slate-200 dark:border-viz-light bg-white dark:bg-viz-medium">
                        <h4 className="font-medium">{kpi.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary mt-1">{kpi.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="bg-viz-dark text-white text-center py-4 text-sm">
        <p className="text-viz-text-secondary">© 2025 Viz • Powered by Advanced Business Intelligence AI</p>
      </footer>
    </div>
  );
};

export default DataControl;
