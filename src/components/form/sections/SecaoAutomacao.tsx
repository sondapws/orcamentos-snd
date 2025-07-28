
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
      <h3 className="text-lg font-semibold mb-4">Automação MIRO e MIGO</h3>
      
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
