
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Step2Data } from '@/types/formData';
import SegmentSelector from './sections/SeletorSegmento';
import ScopeSelector from './sections/SeletorEscopo';
import AutomationSection from './sections/SecaoAutomacao';
import AbrangenciaSection from './sections/SecaoAbrangencia';
import ConfiguracaoSection from './sections/SecaoConfiguracao';

interface FormStep2Props {
  data: Step2Data;
  onUpdate: (data: Partial<Step2Data>) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const FormularioComplyEDocs2: React.FC<FormStep2Props> = ({ data, onUpdate, onPrev, onSubmit }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [quantidadePrefeiturasInbound, setQuantidadePrefeiturasInbound] = React.useState(0);
  const [quantidadePrefeiturasOutbound, setQuantidadePrefeiturasOutbound] = React.useState(0);

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.segmento) {
      newErrors.segmento = 'Selecione o segmento da empresa';
    }

    if (data.escopoInbound.length === 0 && data.escopoOutbound.length === 0) {
      newErrors.escopo = 'Selecione pelo menos um escopo (Inbound ou Outbound)';
    }

    if (!data.volumetriaNotas) {
      newErrors.volumetriaNotas = 'Selecione a volumetria de notas';
    }

    if (!data.modalidade) {
      newErrors.modalidade = 'Selecione a modalidade';
    }

    if (!data.prazoContratacao) {
      newErrors.prazoContratacao = 'Selecione o prazo de contratação';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      onSubmit();
    }
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (data[field as keyof Step2Data] as string[]) || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);

    onUpdate({ [field]: newArray });
  };

  const handleQuantidadeChange = (field: string, value: number) => {
    if (field === 'quantidadePrefeiturasInbound') {
      setQuantidadePrefeiturasInbound(value);
    } else if (field === 'quantidadePrefeiturasOutbound') {
      setQuantidadePrefeiturasOutbound(value);
    } else {
      onUpdate({ [field]: value });
    }
  };

  const handleFieldUpdate = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="form-step relative">
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500 text-sm">*</span>
            <span className="text-gray-600 text-sm">Obrigatória</span>
          </div>

          <h2 className="text-2xl font-bold text-blue-600 mb-2">Questionário Técnico</h2>
          <p className="text-gray-600">Informe os detalhes técnicos para calcularmos seu orçamento personalizado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <SegmentSelector
            value={data.segmento}
            onChange={(value) => onUpdate({ segmento: value as any })}
            error={errors.segmento}
          />

          <ScopeSelector
            escopoInbound={data.escopoInbound}
            escopoOutbound={data.escopoOutbound}
            quantidadePrefeiturasInbound={quantidadePrefeiturasInbound}
            quantidadePrefeiturasOutbound={quantidadePrefeiturasOutbound}
            quantidadeConcessionarias={data.quantidadeConcessionarias || 0}
            quantidadeFaturas={data.quantidadeFaturas || 0}
            onCheckboxChange={handleCheckboxChange}
            onQuantidadeChange={handleQuantidadeChange}
            error={errors.escopo}
          />

          <AutomationSection
            modelosNotas={data.modelosNotas}
            cenariosNegocio={data.cenariosNegocio}
            onCheckboxChange={handleCheckboxChange}
          />

          <AbrangenciaSection
            quantidadeEmpresas={data.quantidadeEmpresas}
            quantidadeUfs={data.quantidadeUfs}
            onUpdate={handleFieldUpdate}
          />

          <ConfiguracaoSection
            volumetriaNotas={data.volumetriaNotas}
            modalidade={data.modalidade}
            prazoContratacao={data.prazoContratacao}
            onUpdate={handleFieldUpdate}
            errors={errors}
          />

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Calculator className="w-4 h-4" />
              Gerar Orçamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioComplyEDocs2;
