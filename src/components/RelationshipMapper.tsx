import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseIcon, ArrowRightIcon, PlusIcon, TrashIcon, EditIcon } from 'lucide-react';

interface TableColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
}

interface Relationship {
  id: string;
  source_table: string;
  source_key: string;
  target_table: string;
  target_key: string;
  alias?: string;
  description?: string;
}

const RelationshipMapper: React.FC = () => {
  const [tables, setTables] = useState<{ [tableName: string]: TableColumn[] }>({});
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    source_table: '',
    source_key: '',
    target_table: '',
    target_key: '',
    alias: '',
    description: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadTablesAndRelationships();
    }
  }, [user]);

  const loadTablesAndRelationships = async () => {
    try {
      // Load available tables and columns
      const { data: tableData, error: tableError } = await supabase.rpc('get_user_tables');
      if (tableError) throw tableError;

      // Group columns by table
      const groupedTables: { [tableName: string]: TableColumn[] } = {};
      tableData?.forEach((row) => {
        if (!groupedTables[row.table_name]) {
          groupedTables[row.table_name] = [];
        }
        groupedTables[row.table_name].push(row);
      });
      setTables(groupedTables);

      // Load existing relationships
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('table_relationships')
        .select('*')
        .order('created_at', { ascending: false });

      if (relationshipError) throw relationshipError;
      setRelationships(relationshipData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load tables and relationships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRelationship = async () => {
    if (!formData.source_table || !formData.source_key || !formData.target_table || !formData.target_key) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('table_relationships')
        .insert([{
          ...formData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setRelationships(prev => [data, ...prev]);
      resetForm();
      toast({
        title: "Relationship created",
        description: "Table relationship has been created successfully",
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
      toast({
        title: "Error",
        description: "Failed to create relationship",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRelationship = async () => {
    if (!editingRelationship) return;

    try {
      const { data, error } = await supabase
        .from('table_relationships')
        .update(formData)
        .eq('id', editingRelationship.id)
        .select()
        .single();

      if (error) throw error;

      setRelationships(prev => prev.map(rel => rel.id === editingRelationship.id ? data : rel));
      resetForm();
      toast({
        title: "Relationship updated",
        description: "Table relationship has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating relationship:', error);
      toast({
        title: "Error",
        description: "Failed to update relationship",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      const { error } = await supabase
        .from('table_relationships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRelationships(prev => prev.filter(rel => rel.id !== id));
      toast({
        title: "Relationship deleted",
        description: "Table relationship has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting relationship:', error);
      toast({
        title: "Error",
        description: "Failed to delete relationship",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      source_table: '',
      source_key: '',
      target_table: '',
      target_key: '',
      alias: '',
      description: ''
    });
    setShowCreateForm(false);
    setEditingRelationship(null);
  };

  const startEdit = (relationship: Relationship) => {
    setFormData({
      source_table: relationship.source_table,
      source_key: relationship.source_key,
      target_table: relationship.target_table,
      target_key: relationship.target_key,
      alias: relationship.alias || '',
      description: relationship.description || ''
    });
    setEditingRelationship(relationship);
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viz-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-viz-dark dark:text-white">Table Relationships</h2>
          <p className="text-viz-text-secondary">Manage relationships between your database tables</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-viz-accent hover:bg-viz-accent-light">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRelationship ? 'Edit Relationship' : 'Create New Relationship'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source_table">Source Table</Label>
                <Select value={formData.source_table} onValueChange={(value) => setFormData(prev => ({ ...prev, source_table: value, source_key: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source table" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(tables).map((tableName) => (
                      <SelectItem key={tableName} value={tableName}>
                        {tableName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source_key">Source Column</Label>
                <Select value={formData.source_key} onValueChange={(value) => setFormData(prev => ({ ...prev, source_key: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source column" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.source_table && tables[formData.source_table]?.map((column) => (
                      <SelectItem key={column.column_name} value={column.column_name}>
                        <div className="flex items-center gap-2">
                          {column.column_name}
                          {column.is_primary_key && <Badge variant="outline" className="text-xs">PK</Badge>}
                          {column.is_foreign_key && <Badge variant="outline" className="text-xs">FK</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_table">Target Table</Label>
                <Select value={formData.target_table} onValueChange={(value) => setFormData(prev => ({ ...prev, target_table: value, target_key: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target table" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(tables).map((tableName) => (
                      <SelectItem key={tableName} value={tableName}>
                        {tableName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_key">Target Column</Label>
                <Select value={formData.target_key} onValueChange={(value) => setFormData(prev => ({ ...prev, target_key: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target column" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.target_table && tables[formData.target_table]?.map((column) => (
                      <SelectItem key={column.column_name} value={column.column_name}>
                        <div className="flex items-center gap-2">
                          {column.column_name}
                          {column.is_primary_key && <Badge variant="outline" className="text-xs">PK</Badge>}
                          {column.is_foreign_key && <Badge variant="outline" className="text-xs">FK</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="alias">Alias (Optional)</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                placeholder="Enter a friendly name for this relationship"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this relationship"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={editingRelationship ? handleUpdateRelationship : handleCreateRelationship}>
                {editingRelationship ? 'Update Relationship' : 'Create Relationship'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Relationships */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-viz-dark dark:text-white">Existing Relationships</h3>
        {relationships.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <DatabaseIcon className="w-12 h-12 mx-auto text-viz-text-secondary mb-4" />
              <p className="text-viz-text-secondary">No relationships defined yet</p>
              <p className="text-sm text-viz-text-secondary mt-1">Create your first table relationship to get started</p>
            </CardContent>
          </Card>
        ) : (
          relationships.map((relationship) => (
            <Card key={relationship.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{relationship.source_table}</Badge>
                      <span className="text-viz-text-secondary">{relationship.source_key}</span>
                      <ArrowRightIcon className="w-4 h-4 text-viz-accent" />
                      <Badge variant="outline">{relationship.target_table}</Badge>
                      <span className="text-viz-text-secondary">{relationship.target_key}</span>
                    </div>
                    {relationship.alias && (
                      <Badge className="bg-viz-accent/10 text-viz-accent">{relationship.alias}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(relationship)}>
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRelationship(relationship.id)}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {relationship.description && (
                  <p className="text-sm text-viz-text-secondary mt-2">{relationship.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RelationshipMapper;
