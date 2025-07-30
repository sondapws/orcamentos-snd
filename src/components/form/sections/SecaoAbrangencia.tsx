
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface AbrangenciaSectionProps {
  quantidadeEmpresas: number;
  quantidadeUfs: number;
  onUpdate: (field: string, value: number) => void;
}

const AbrangenciaSection: React.FC<AbrangenciaSectionProps> = ({
  quantidadeEmpresas,
  quantidadeUfs,
  onUpdate
}) => {
  return (
    <div className="border-t pt-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Abrangência</h3>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {
            const text = "Abrangência do sistema. Informe a quantidade de empresas matriz e a quantidade de estados (UFs) onde sua empresa atua para dimensionar adequadamente a solução.";
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="quantidadeEmpresas">Quantidade de Empresas (Matriz)</Label>
            <FieldSpeechButton
              fieldId="quantidadeEmpresas"
              label="Quantidade de Empresas"
              value={quantidadeEmpresas}
            />
          </div>
          <Input
            id="quantidadeEmpresas"
            type="number"
            min="1"
            value={quantidadeEmpresas}
            onChange={(e) => onUpdate('quantidadeEmpresas', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="quantidadeUfs">Quantidade de UFs</Label>
            <FieldSpeechButton
              fieldId="quantidadeUfs"
              label="Quantidade de UFs"
              value={quantidadeUfs}
            />
          </div>
          <Input
            id="quantidadeUfs"
            type="number"
            min="1"
            max="27"
            value={quantidadeUfs}
            onChange={(e) => onUpdate('quantidadeUfs', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default AbrangenciaSection;
