
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { volumetriaOptions, modalidadeOptions, prazoContratacaoOptions } from '@/data/formOptions';

interface ConfiguracaoSectionProps {
  volumetriaNotas: string;
  modalidade: string;
  prazoContratacao: number;
  onUpdate: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const ConfiguracaoSection: React.FC<ConfiguracaoSectionProps> = ({
  volumetriaNotas,
  modalidade,
  prazoContratacao,
  onUpdate,
  errors
}) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Configurações</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Volumetria de Notas *</Label>
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

        <div className="space-y-2">
          <Label>Modalidade *</Label>
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

        <div className="space-y-2">
          <Label>Prazo de Contratação *</Label>
          <Select 
            value={prazoContratacao.toString()} 
            onValueChange={(value) => onUpdate('prazoContratacao', parseInt(value))}
          >
            <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.prazoContratacao ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {prazoContratacaoOptions.map(option => (
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

export default ConfiguracaoSection;
