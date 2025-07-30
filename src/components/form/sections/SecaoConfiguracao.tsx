
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { volumetriaOptions, modalidadeOptions, prazoContratacaoOptions } from '@/data/formOptions';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

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
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Configurações</h3>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {
            const text = "Configurações do sistema. Defina a volumetria mensal de notas fiscais, a modalidade de instalação e o prazo de contratação do serviço para personalizar sua proposta.";
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            speechSynthesis.speak(utterance);
          }}
          title="Leitura avançada"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.078-1.343-4.243a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829 1 1 0 11-1.415-1.414A3.987 3.987 0 0013 12a3.987 3.987 0 00-.172-1.415 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Prazo de Contratação *</Label>
            <FieldSpeechButton
              fieldId="prazoContratacao"
              label="Prazo de Contratação"
              value={prazoContratacao ? prazoContratacaoOptions.find(p => p.value === prazoContratacao)?.label || `${prazoContratacao} meses` : ''}
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
