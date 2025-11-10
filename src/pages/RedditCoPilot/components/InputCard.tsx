import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface InputCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const InputCard: React.FC<InputCardProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <Card className={`bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-viz-dark dark:text-white">{title}</CardTitle>
        {description && (
          <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default InputCard;

// Multi-tag input component for keywords
interface MultiTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const MultiTagInput: React.FC<MultiTagInputProps> = ({
  value,
  onChange,
  placeholder = "Type a keyword and press Enter",
  label = "Keywords"
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label className="text-viz-dark dark:text-white">{label}</Label>}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Industry dropdown options
export const industryOptions = [
  'SaaS',
  'E-commerce',
  'Finance',
  'Healthcare',
  'Education',
  'Real Estate',
  'Marketing',
  'Technology',
  'Food & Beverage',
  'Fashion',
  'Travel',
  'Fitness',
  'Consulting',
  'Legal',
  'Insurance',
  'Automotive',
  'Other'
];
