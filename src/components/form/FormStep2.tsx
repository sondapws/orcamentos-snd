
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Step2Data } from '@/types/formData';
import {
  segmentosEmpresa,
  escopoInboundOptions,
  escopoOutboundOptions,
  modelosNotasOptions,
  cenariosNegocioOptions,
  volumetriaOptions,
  modalidadeOptions,
  prazoContratacaoOptions
} from '@/data/formOptions';

interface FormStep2Props {
  data: Step2Data;
  onUpdate: (data: Partial<Step2Data>) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const FormStep2: React.FC<FormStep2Props> = ({ data, onUpdate, onPrev, onSubmit }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const hasNfse = data.escopoInbound.includes('nfse') || data.escopoOutbound.includes('nfse');
  const hasFaturas = data.escopoInbound.includes('faturas');

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

  const handleCheckboxChange = (field: keyof Step2Data, value: string, checked: boolean) => {
    const currentArray = (data[field] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onUpdate({ [field]: newArray });
  };

  return (
    <div className="form-step relative">
      {/* Background decorative elements */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-10 pointer-events-none z-0">
        <img 
          src="/lovable-uploads/a794b093-7b63-4034-afb5-988846dd828b.png" 
          alt="Background decoration"
          className="w-full h-full object-contain"
        />
      </div>

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
          {/* Segmento da Empresa */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Segmento da Empresa *</Label>
            <Select value={data.segmento} onValueChange={(value) => onUpdate({ segmento: value as any })}>
              <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.segmento ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                {segmentosEmpresa.map(segmento => (
                  <SelectItem key={segmento.value} value={segmento.value}>
                    {segmento.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.segmento && <p className="text-red-500 text-sm">{errors.segmento}</p>}
          </div>

          {/* Escopo Inbound */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Escopo - Inbound (múltipla seleção)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {escopoInboundOptions.map(option => (
                <div key={`inbound-${option.value}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`inbound-${option.value}`}
                    checked={data.escopoInbound.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('escopoInbound', option.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`inbound-${option.value}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Escopo Outbound */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Escopo - Outbound (múltipla seleção)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {escopoOutboundOptions.map(option => (
                <div key={`outbound-${option.value}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`outbound-${option.value}`}
                    checked={data.escopoOutbound.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('escopoOutbound', option.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`outbound-${option.value}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.escopo && <p className="text-red-500 text-sm">{errors.escopo}</p>}
          </div>

          {/* Automação MIRO e MIGO */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Automação MIRO e MIGO</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Modelos de Notas */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Modelos de Notas (múltipla seleção)</Label>
                <div className="space-y-2">
                  {modelosNotasOptions.map(option => (
                    <div key={`modelo-${option.value}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modelo-${option.value}`}
                        checked={data.modelosNotas.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('modelosNotas', option.value, checked as boolean)
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
                <Label className="text-base font-semibold">Cenários de Negócio (múltipla seleção)</Label>
                <div className="space-y-2">
                  {cenariosNegocioOptions.map(option => (
                    <div key={`cenario-${option.value}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cenario-${option.value}`}
                        checked={data.cenariosNegocio.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('cenariosNegocio', option.value, checked as boolean)
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

          {/* Abrangência */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Abrangência</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidadeEmpresas">Quantidade de Empresas (Matriz)</Label>
                <Input
                  id="quantidadeEmpresas"
                  type="number"
                  min="1"
                  value={data.quantidadeEmpresas}
                  onChange={(e) => onUpdate({ quantidadeEmpresas: parseInt(e.target.value) || 1 })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeUfs">Quantidade de UFs</Label>
                <Input
                  id="quantidadeUfs"
                  type="number"
                  min="1"
                  max="27"
                  value={data.quantidadeUfs}
                  onChange={(e) => onUpdate({ quantidadeUfs: parseInt(e.target.value) || 1 })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {hasNfse && (
                <div className="space-y-2">
                  <Label htmlFor="quantidadePrefeituras">Quantidade de Prefeituras</Label>
                  <Input
                    id="quantidadePrefeituras"
                    type="number"
                    min="0"
                    value={data.quantidadePrefeituras || 0}
                    onChange={(e) => onUpdate({ quantidadePrefeituras: parseInt(e.target.value) || 0 })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

              {hasFaturas && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="quantidadeConcessionarias">Quantidade de Concessionárias</Label>
                    <Input
                      id="quantidadeConcessionarias"
                      type="number"
                      min="0"
                      value={data.quantidadeConcessionarias || 0}
                      onChange={(e) => onUpdate({ quantidadeConcessionarias: parseInt(e.target.value) || 0 })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidadeFaturas">Quantidade de Faturas</Label>
                    <Input
                      id="quantidadeFaturas"
                      type="number"
                      min="0"
                      value={data.quantidadeFaturas || 0}
                      onChange={(e) => onUpdate({ quantidadeFaturas: parseInt(e.target.value) || 0 })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Configurações Finais */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Configurações</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Volumetria de Notas *</Label>
                <Select value={data.volumetriaNotas} onValueChange={(value) => onUpdate({ volumetriaNotas: value })}>
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
                <Select value={data.modalidade} onValueChange={(value) => onUpdate({ modalidade: value as any })}>
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
                  value={data.prazoContratacao.toString()} 
                  onValueChange={(value) => onUpdate({ prazoContratacao: parseInt(value) })}
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

export default FormStep2;
