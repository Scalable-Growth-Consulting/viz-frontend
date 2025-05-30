
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import RelationshipMapper from '@/components/RelationshipMapper';
import BigQueryConnection from '@/components/BigQueryConnection';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import { DatabaseIcon, LinkIcon, MessageSquareIcon } from 'lucide-react';

const DataControl = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-viz-dark dark:text-white mb-2">Data Control Center</h1>
          <p className="text-viz-text-secondary">Manage your data connections, relationships, and AI interactions</p>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <DatabaseIcon className="w-4 h-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Relationships
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <EnhancedChatInterface />
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <BigQueryConnection />
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <RelationshipMapper />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataControl;
