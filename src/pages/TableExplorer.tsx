import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TableList from '../components/TableList';
import SchemaEditor from '../components/SchemaEditor';
import Loader from '../components/ui/loader';
import { Button } from '@/components/ui/button';
import { SaveIcon, RefreshCwIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface Table {
  id: string;
  name: string;
  projectId: string;
  datasetId: string;
  description?: string;
  lastModified: string;
}

export interface Column {
  name: string;
  dataType: string;
  description?: string;
  enumValues?: string[];
  isRequired: boolean;
  mode: 'NULLABLE' | 'REQUIRED' | 'REPEATED';
}

export interface TableSchema {
  tableId: string;
  description?: string; 
  columns: Column[];
}

const TableExplorer = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editedTableName, setEditedTableName] = useState<string>('');
  const [editedTableDescription, setEditedTableDescription] = useState<string>('');
  const { toast } = useToast();

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Load schema when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchTableSchema(selectedTable.id);
    }
  }, [selectedTable]);

  // When selectedTable changes, reset edited fields
  useEffect(() => {
    if (selectedTable) {
      setEditedTableName(selectedTable.name);
      setEditedTableDescription(selectedTable.description || '');
    } else {
      setEditedTableName('');
      setEditedTableDescription('');
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    setIsLoadingTables(true);
    try {
      // Mock API call - replace with actual BigQuery API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTables: Table[] = [
        {
          id: 'orders',
          name: 'orders',
          projectId: 'my-project',
          datasetId: 'ecommerce',
          description: 'Customer orders data',
          lastModified: '2025-01-20T10:30:00Z'
        },
        {
          id: 'customers',
          name: 'customers',
          projectId: 'my-project',
          datasetId: 'ecommerce',
          description: 'Customer information',
          lastModified: '2025-01-19T15:45:00Z'
        },
        {
          id: 'products',
          name: 'products',
          projectId: 'my-project',
          datasetId: 'ecommerce',
          description: 'Product catalog',
          lastModified: '2025-01-18T09:20:00Z'
        },
        {
          id: 'transactions',
          name: 'transactions',
          projectId: 'my-project',
          datasetId: 'ecommerce',
          lastModified: '2025-01-17T14:10:00Z'
        }
      ];
      setTables(mockTables);
      if (mockTables.length > 0) {
        setSelectedTable(mockTables[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tables from BigQuery",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const fetchTableSchema = async (tableId: string) => {
    setIsLoadingSchema(true);
    try {
      // Mock API call - replace with actual BigQuery API
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockSchemas: Record<string, TableSchema> = {
        orders: {
          tableId: 'orders',
          columns: [
            {
              name: 'order_id',
              dataType: 'STRING',
              description: 'Unique order identifier',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'customer_id',
              dataType: 'STRING',
              description: 'Customer identifier',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'order_date',
              dataType: 'TIMESTAMP',
              description: 'Date when order was placed',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'status',
              dataType: 'STRING',
              description: 'Order status',
              enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'total_amount',
              dataType: 'NUMERIC',
              description: 'Total order amount',
              isRequired: true,
              mode: 'REQUIRED'
            }
          ]
        },
        customers: {
          tableId: 'customers',
          columns: [
            {
              name: 'customer_id',
              dataType: 'STRING',
              description: 'Unique customer identifier',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'email',
              dataType: 'STRING',
              description: 'Customer email address',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'first_name',
              dataType: 'STRING',
              description: 'Customer first name',
              isRequired: false,
              mode: 'NULLABLE'
            },
            {
              name: 'last_name',
              dataType: 'STRING',
              description: 'Customer last name',
              isRequired: false,
              mode: 'NULLABLE'
            },
            {
              name: 'created_at',
              dataType: 'TIMESTAMP',
              description: 'Account creation timestamp',
              isRequired: true,
              mode: 'REQUIRED'
            }
          ]
        },
        products: {
          tableId: 'products',
          columns: [
            {
              name: 'product_id',
              dataType: 'STRING',
              description: 'Unique product identifier',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'name',
              dataType: 'STRING',
              description: 'Product name',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'category',
              dataType: 'STRING',
              description: 'Product category',
              enumValues: ['electronics', 'clothing', 'books', 'home', 'sports'],
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'price',
              dataType: 'NUMERIC',
              description: 'Product price',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'in_stock',
              dataType: 'BOOLEAN',
              description: 'Whether product is in stock',
              isRequired: true,
              mode: 'REQUIRED'
            }
          ]
        },
        transactions: {
          tableId: 'transactions',
          columns: [
            {
              name: 'transaction_id',
              dataType: 'STRING',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'order_id',
              dataType: 'STRING',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'payment_method',
              dataType: 'STRING',
              enumValues: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'amount',
              dataType: 'NUMERIC',
              isRequired: true,
              mode: 'REQUIRED'
            },
            {
              name: 'processed_at',
              dataType: 'TIMESTAMP',
              isRequired: true,
              mode: 'REQUIRED'
            }
          ]
        }
      };
      setSchema(mockSchemas[tableId] || null);
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch table schema",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleSchemaChange = (updatedSchema: TableSchema) => {
    setSchema(updatedSchema);
    setHasChanges(true);
  };

  // Update table name/description handlers
  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTableName(e.target.value);
    setHasChanges(true);
  };
  const handleTableDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTableDescription(e.target.value);
    setHasChanges(true);
  };

  // Update save handler to persist table name/description
  const handleSaveChanges = async () => {
    if (!schema || !hasChanges) return;
    setIsSaving(true);
    try {
      // Mock API call to save changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update selectedTable and tables state
      if (selectedTable) {
        const updatedTable = {
          ...selectedTable,
          name: editedTableName,
          description: editedTableDescription,
        };
        setSelectedTable(updatedTable);
        setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
      }
      toast({
        title: "Success",
        description: "Schema and table info saved successfully",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schema or table info",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    if (selectedTable) {
      fetchTableSchema(selectedTable.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-viz-dark">
      <Header />
      <main className="flex-1 px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              BigQuery Table Explorer
            </h1>
            <p className="text-slate-600 dark:text-viz-text-secondary mt-1">
              Browse tables and manage schema metadata
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoadingSchema}
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              className="bg-viz-accent hover:bg-viz-accent-light"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Table List - Right Pane */}
          <div className="lg:col-span-1">
            <div className="viz-card h-full">
              <div className="p-4 border-b border-slate-200 dark:border-viz-light/20">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Tables ({tables.length})
                </h2>
              </div>
              <div className="flex-1 overflow-auto">
                {isLoadingTables ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader size="sm" text="Loading tables..." />
                  </div>
                ) : (
                  <TableList
                    tables={tables}
                    selectedTable={selectedTable}
                    onTableSelect={setSelectedTable}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Schema Editor - Main Pane */}
          <div className="lg:col-span-3">
            <div className="viz-card h-full">
              {selectedTable ? (
                <>
                  <div className="p-4 border-b border-slate-200 dark:border-viz-light/20">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Table Name
                      </label>
                      <Input
                        className="text-lg font-semibold text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:border-viz-accent focus:ring-viz-accent/20"
                        value={editedTableName}
                        onChange={handleTableNameChange}
                        placeholder={selectedTable?.name || "Enter table name..."}
                        disabled={isLoadingSchema}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Table Description
                      </label>
                      <Textarea
                        className="text-sm text-slate-600 dark:text-slate-200 min-h-[60px] border-slate-300 dark:border-slate-600 focus:border-viz-accent focus:ring-viz-accent/20"
                        value={editedTableDescription}
                        onChange={handleTableDescriptionChange}
                        placeholder={selectedTable?.description || "Enter table description..."}
                        disabled={isLoadingSchema}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {isLoadingSchema ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader size="md" text="Loading schema..." />
                      </div>
                    ) : schema ? (
                      <SchemaEditor
                        schema={schema}
                        onChange={handleSchemaChange}
                        onSave={handleSaveChanges}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-40 text-slate-500 dark:text-viz-text-secondary">
                        No schema available for this table
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-viz-text-secondary">
                  Select a table to view its schema
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableExplorer;
