import React, { useState } from 'react';
import { TableSchema, Column } from '../pages/TableExplorer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusIcon, XIcon, EditIcon } from 'lucide-react';

interface SchemaEditorProps {
  schema: TableSchema;
  onChange: (schema: TableSchema) => void;
  onSave: () => void;
}

const DATA_TYPES = [
  'STRING',
  'INTEGER',
  'FLOAT',
  'NUMERIC',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'TIME',
  'DATETIME',
  'BYTES',
  'ARRAY',
  'STRUCT',
  'JSON'
];

const SchemaEditor: React.FC<SchemaEditorProps> = ({ schema, onChange, onSave }) => {
  const [editingEnums, setEditingEnums] = useState<string | null>(null);
  const [newEnumValue, setNewEnumValue] = useState('');

  const updateColumn = (columnIndex: number, field: keyof Column, value: unknown) => {
    const updatedColumns = [...schema.columns];
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      [field]: value
    };
    onChange({ ...schema, columns: updatedColumns });
  };

  const addEnumValue = (columnIndex: number) => {
    if (!newEnumValue.trim()) return;
    
    const column = schema.columns[columnIndex];
    const updatedEnumValues = [...(column.enumValues || []), newEnumValue.trim()];
    updateColumn(columnIndex, 'enumValues', updatedEnumValues);
    setNewEnumValue('');
  };

  const removeEnumValue = (columnIndex: number, enumIndex: number) => {
    const column = schema.columns[columnIndex];
    const updatedEnumValues = column.enumValues?.filter((_, i) => i !== enumIndex) || [];
    updateColumn(columnIndex, 'enumValues', updatedEnumValues.length > 0 ? updatedEnumValues : undefined);
  };

  const handleStartEditingEnums = (columnName: string) => {
    setEditingEnums(columnName);
    setNewEnumValue('');
  };

  const handleFinishEditingEnums = () => {
    setEditingEnums(null);
    setNewEnumValue('');
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Column Name</TableHead>
              <TableHead className="w-[150px]">Data Type</TableHead>
              <TableHead className="w-[450px]">Description</TableHead>
              <TableHead>Enum Values</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.columns.map((column, index) => (
              <TableRow key={column.name}>
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {column.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-800 dark:text-slate-200">{column.dataType}</div>
                </TableCell>
                <TableCell>
                  <Textarea
                    value={column.description || ''}
                    onChange={(e) => updateColumn(index, 'description', e.target.value)}
                    placeholder="Add description..."
                    className="min-h-[60px] resize-none"
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {column.enumValues && column.enumValues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {column.enumValues.map((enumValue, enumIndex) => (
                          <div key={enumIndex} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {enumValue}
                              {editingEnums === column.name && (
                                <button
                                  onClick={() => removeEnumValue(index, enumIndex)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    {editingEnums === column.name ? (
                      <div className="flex gap-2">
                        <Input
                          value={newEnumValue}
                          onChange={(e) => setNewEnumValue(e.target.value)}
                          placeholder="Add enum value..."
                          className="text-xs"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addEnumValue(index);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => addEnumValue(index)}
                          disabled={!newEnumValue.trim()}
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleFinishEditingEnums}
                        >
                          Done
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEditingEnums(column.name)}
                        className="text-xs"
                      >
                        <EditIcon className="w-3 h-3 mr-1" />
                        {column.enumValues && column.enumValues.length > 0 ? 'Edit' : 'Add'} Enums
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={onSave} variant="default">Save</Button>
      </div>
    </div>
  );
};

export default SchemaEditor;
