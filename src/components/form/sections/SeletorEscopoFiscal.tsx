import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface ScopeSelectorFiscalProps {
  escopo: string[];
  onCheckboxChange: (field: string, value: string, checked: boolean) => void;
  error?: string;
}

const ScopeSelectorFiscal: React.FC<ScopeSelectorFiscalProps> = ({ 
  escopo, 
  onCheckboxChange, 
  error 
}) => {
  const scopeOptions = [
    {
      id: 'fiscal',
      label: 'Fiscal (Apuração de Impostos diretos e indiretos, Obrigações Acessórias, SPED Fiscal e SPED Contribuições)'
    },
    {
      id: 'contabil',
      label: 'Contábil (Apuração IRPJ/CSLL, SPED ECD e SPED ECF)'
    },
    {
      id: 'sped-reinf',
      label: 'SPED REINF'
    },
    {
      id: 'industrializacao',
      label: 'Industrialização Bloco K (SPED Fiscal)'
    }
  ];

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    onCheckboxChange('escopo', optionId, checked);
  };

  return (
    <div className="border-t pt-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-gray-600 font-medium">Escopo <span className="text-red-500">*</span></Label>
          <FieldSpeechButton
            fieldId="escopo"
            label="Escopo"
            value={escopo.join(', ')}
          />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Selecione todas as opções que se aplicam ao seu negócio:
        </p>

        <div className="space-y-3">
          {scopeOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <Checkbox
                id={option.id}
                checked={escopo.includes(option.id)}
                onCheckedChange={(checked) => handleCheckboxChange(option.id, checked as boolean)}
              />
              <Label 
                htmlFor={option.id} 
                className="text-sm cursor-pointer flex-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ScopeSelectorFiscal;