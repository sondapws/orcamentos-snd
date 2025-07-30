
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { modelosNotasOptions, cenariosNegocioOptions } from '@/data/formOptions';

interface AutomationSectionProps {
  modelosNotas: string[];
  cenariosNegocio: string[];
  onCheckboxChange: (field: string, value: string, checked: boolean) => void;
}

const AutomationSection: React.FC<AutomationSectionProps> = ({
  modelosNotas,
  cenariosNegocio,
  onCheckboxChange
}) => {
  return (
    <div className="border-t pt-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Automação MIRO e MIGO</h3>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {
            const text = "Automação MIRO e MIGO. Selecione os modelos de notas e cenários de negócio que sua empresa utiliza para automatizar os processos de entrada e saída de mercadorias.";
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modelos de Notas */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Modelos de Notas</Label>
          <div className="space-y-2">
            {modelosNotasOptions.map(option => (
              <div key={`modelo-${option.value}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`modelo-${option.value}`}
                  checked={modelosNotas.includes(option.value)}
                  onCheckedChange={(checked) => 
                    onCheckboxChange('modelosNotas', option.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`modelo-${option.value}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Cenários de Negócio */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Cenários de Negócio</Label>
          <div className="space-y-2">
            {cenariosNegocioOptions.map(option => (
              <div key={`cenario-${option.value}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`cenario-${option.value}`}
                  checked={cenariosNegocio.includes(option.value)}
                  onCheckedChange={(checked) => 
                    onCheckboxChange('cenariosNegocio', option.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`cenario-${option.value}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationSection;
