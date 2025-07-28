
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { segmentosEmpresa } from '@/data/formOptions';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface SegmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const SegmentSelector: React.FC<SegmentSelectorProps> = ({ value, onChange, error }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold">Segmento da Empresa *</Label>
        <FieldSpeechButton
          fieldId="segmento"
          label="Segmento da Empresa"
          value={value ? segmentosEmpresa.find(s => s.value === value)?.label || value : ''}
        />
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder="Selecione o segmento" />
        </SelectTrigger>
        <SelectContent>
          {segmentosEmpresa.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default SegmentSelector;
