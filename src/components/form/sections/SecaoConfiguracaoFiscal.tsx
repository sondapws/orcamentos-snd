import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface ConfiguracaoFiscalSectionProps {
  volumetriaNotas: string;
  modalidade: string;
  prazoContratacao: number;
  onUpdate: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const ConfiguracaoFiscalSection: React.FC<ConfiguracaoFiscalSectionProps> = ({
  volumetriaNotas,
  modalidade,
  prazoContratacao,
  onUpdate,
  errors
}) => {
  const volumetriaOptions = [
    { value: 'ate-7000', label: 'Até 7.000' },
    { value: 'ate-20000', label: 'Até 20.000' },
    { value: 'ate-50000', label: 'Até 50.000' },
    { value: 'ate-70000', label: 'Até 70.000' },
    { value: 'maior-70000', label: 'Maior que 70.000' },
    { value: 'maior-70000-consumo', label: 'Maior que 70.000 com Nota Fiscal de Consumo' }
  ];

  const modalidadeOptions = [
    { value: 'on-premise', label: 'On-premise (Instalação local)' },
    { value: 'saas', label: 'SaaS (Software as a Service)' }
  ];

  const prazoOptions = [
    { value: 12, label: '12 meses' },
    { value: 24, label: '24 meses' },
    { value: 36, label: '36 meses' },
    { value: 48, label: '48 meses' },
    { value: 60, label: '60 meses' }
  ];

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Configurações</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Volumetria de Notas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Volumetria de Notas *</Label>
            <FieldSpeechButton
              fieldId="volumetriaNotas"
              label="Volumetria de Notas"
              value={volumetriaNotas ? volumetriaOptions.find(v => v.value === volumetriaNotas)?.label || volumetriaNotas : ''}
            />
          </div>
          <Select value={volumetriaNotas} onValueChange={(value) => onUpdate('volumetriaNotas', value)}>
            <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.volumetriaNotas ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {volumetriaOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.volumetriaNotas && <p className="text-red-500 text-sm">{errors.volumetriaNotas}</p>}
        </div>

        {/* Modalidade */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Modalidade *</Label>
            <FieldSpeechButton
              fieldId="modalidade"
              label="Modalidade"
              value={modalidade ? modalidadeOptions.find(m => m.value === modalidade)?.label || modalidade : ''}
            />
          </div>
          <Select value={modalidade} onValueChange={(value) => onUpdate('modalidade', value)}>
            <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.modalidade ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {modalidadeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.modalidade && <p className="text-red-500 text-sm">{errors.modalidade}</p>}
        </div>

        {/* Prazo de Contratação */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Prazo de Contratação *</Label>
            <FieldSpeechButton
              fieldId="prazoContratacao"
              label="Prazo de Contratação"
              value={prazoContratacao ? prazoOptions.find(p => p.value === prazoContratacao)?.label || `${prazoContratacao} meses` : ''}
            />
          </div>
          <Select
            value={prazoContratacao.toString()}
            onValueChange={(value) => onUpdate('prazoContratacao', parseInt(value))}
          >
            <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.prazoContratacao ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {prazoOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.prazoContratacao && <p className="text-red-500 text-sm">{errors.prazoContratacao}</p>}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoFiscalSection;