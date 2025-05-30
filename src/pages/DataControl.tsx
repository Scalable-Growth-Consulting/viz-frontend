
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import RelationshipMapper from '@/components/RelationshipMapper';
import BigQueryConnection from '@/components/BigQueryConnection';
import { DatabaseIcon, LinkIcon, BarChart3Icon } from 'lucide-react';

const DataControl = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-viz-dark dark:text-white mb-2">Data Control Center</h1>
          <p className="text-viz-text-secondary">Manage your data connections, relationships, and custom KPIs</p>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <DatabaseIcon className="w-4 h-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Relationships
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <BarChart3Icon className="w-4 h-4" />
              Custom KPIs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <BigQueryConnection />
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <RelationshipMapper />
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3Icon className="w-16 h-16 mx-auto text-viz-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-viz-dark dark:text-white mb-2">Custom KPIs</h3>
              <p className="text-viz-text-secondary">Define and manage your key performance indicators</p>
              <p className="text-sm text-viz-text-secondary mt-2">Coming soon - Create custom metrics and dashboards</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataControl;
