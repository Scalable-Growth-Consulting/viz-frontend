import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { DatabaseIcon, BarChartIcon, PlusIcon, SaveIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DataControl = () => {
  const navigate = useNavigate();
  const [jsonSchema, setJsonSchema] = useState('');
  const [kpiName, setKpiName] = useState('');
  const [kpiDescription, setKpiDescription] = useState('');
  const [kpiFormula, setKpiFormula] = useState('');
  const [bigQueryModalOpen, setBigQueryModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [connectionDetails, setConnectionDetails] = useState({
    projectId: '',
    datasetId: '',
    keyFile: null,
    location: 'US',
    testConnection: false
  });

  // Create a form instance for the BigQuery connection form
  const form = useForm({
    defaultValues: {
      projectId: '',
      datasetId: '',
      keyFile: null,
      location: 'US',
    }
  });

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

  const handleBigQueryConnect = () => {
    setBigQueryModalOpen(true);
  };

  const handleConnectionDetailChange = (field: string, value: any) => {
    setConnectionDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit connection and redirect to Table Explorer
      setBigQueryModalOpen(false);
      alert('BigQuery connection added successfully!');
      setCurrentStep(1);
      // Redirect to Table Explorer
      navigate('/table-explorer');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderBigQueryStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
              Enter your Google Cloud project details to connect to BigQuery.
            </p>

            <FormItem>
              <FormLabel>Project ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="my-project-id" 
                  value={connectionDetails.projectId}
                  onChange={(e) => handleConnectionDetailChange('projectId', e.target.value)}
                />
              </FormControl>
              <FormDescription>
                The Google Cloud project ID where your BigQuery dataset is located.
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Dataset ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="my_dataset" 
                  value={connectionDetails.datasetId}
                  onChange={(e) => handleConnectionDetailChange('datasetId', e.target.value)}
                />
              </FormControl>
              <FormDescription>
                The BigQuery dataset you want to connect to.
              </FormDescription>
            </FormItem>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
              Upload your service account key file (JSON) for authentication.
            </p>

            <FormItem>
              <FormLabel>Service Account Key File</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-slate-200 dark:border-viz-light rounded-md p-6 text-center">
                  <Input
                    type="file"
                    className="hidden" 
                    id="keyFile"
                    accept="application/json"
                    onChange={(e) => handleConnectionDetailChange('keyFile', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="keyFile" className="cursor-pointer flex flex-col items-center">
                    <DatabaseIcon className="w-8 h-8 text-viz-text-secondary mb-2" />
                    <span className="text-sm font-medium">Click to upload key file</span>
                    <span className="text-xs text-slate-500 dark:text-viz-text-secondary mt-1">
                      {connectionDetails.keyFile ? connectionDetails.keyFile.name : 'JSON service account key'}
                    </span>
                  </label>
                </div>
              </FormControl>
              <FormDescription>
                A service account key with BigQuery access permissions.
              </FormDescription>
            </FormItem>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
              Configure additional options and test your connection.
            </p>

            <FormItem>
              <FormLabel>Data Location</FormLabel>
              <Select 
                value={connectionDetails.location}
                onValueChange={(value) => handleConnectionDetailChange('location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">US (United States)</SelectItem>
                  <SelectItem value="EU">EU (European Union)</SelectItem>
                  <SelectItem value="asia-northeast1">Asia Northeast 1 (Tokyo)</SelectItem>
                  <SelectItem value="europe-west2">Europe West 2 (London)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The geographic location where your data is stored.
              </FormDescription>
            </FormItem>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => handleConnectionDetailChange('testConnection', true)}
            >
              Test Connection
            </Button>

            {connectionDetails.testConnection && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Connection successful!
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
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
                    <div 
                      className="p-4 rounded-lg border border-slate-200 dark:border-viz-light bg-white dark:bg-viz-medium hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                      onClick={handleBigQueryConnect}
                    >
                      <span className="font-medium text-viz-accent">BigQuery</span>
                      <PlusIcon className="w-5 h-5 text-viz-accent" />
                    </div>
                    
                    {['CSV Upload', 'Snowflake', 'PostgreSQL', 'MySQL', 'Excel'].map((connector, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-slate-200 dark:border-viz-light bg-white dark:bg-viz-medium flex items-center justify-between opacity-70">
                        <div className="flex items-center">
                          <span>{connector}</span>
                          <span className="ml-2 text-xs py-0.5 px-1.5 bg-slate-200 dark:bg-viz-light rounded text-slate-600 dark:text-slate-400">WIP</span>
                        </div>
                        <AlertCircleIcon className="w-4 h-4 text-slate-400" />
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

      {/* BigQuery Connection Modal */}
      <Dialog open={bigQueryModalOpen} onOpenChange={setBigQueryModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Connect to BigQuery</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3: {currentStep === 1 ? 'Project Details' : currentStep === 2 ? 'Authentication' : 'Configuration'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Fix: Wrap form content in a Form component with the form instance provided */}
          <Form {...form}>
            {renderBigQueryStepContent()}
          </Form>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button onClick={nextStep}>
              {currentStep < 3 ? 'Next' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataControl;
