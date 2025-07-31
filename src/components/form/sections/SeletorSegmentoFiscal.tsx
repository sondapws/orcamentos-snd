import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface SegmentSelectorFiscalProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const SegmentSelectorFiscal: React.FC<SegmentSelectorFiscalProps> = ({ value, onChange, error }) => {
  const segments = [
    { value: 'industria', label: 'Indústria, Varejo ou Outros' },
    { value: 'utilities', label: 'Utilities (Serviços Públicos - Energia, Água, Gás, Saneamento)' },
    { value: 'servico', label: 'Serviço' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-gray-600 font-medium">Segmento da Empresa <span className="text-red-500">*</span></Label>
        <FieldSpeechButton
          fieldId="segmento"
          label="Segmento da Empresa"
          value={value ? segments.find(s => s.value === value)?.label || value : ''}
        />
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder="Selecione o segmento" />
        </SelectTrigger>
        <SelectContent>
          {segments.map(option => (
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

export default SegmentSelectorFiscal;