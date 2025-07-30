import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Step2DataFiscal, FormDataFiscal } from '@/types/formDataFiscal';
import { isSondaEmail } from '@/utils/emailValidation';
import { approvalService } from '@/services/approvalService';
import { useToast } from '@/hooks/use-toast';
import SegmentSelectorFiscal from './sections/SeletorSegmentoFiscal';
import ScopeSelectorFiscal from './sections/SeletorEscopoFiscal';
import AbrangenciaFiscalSection from './sections/SecaoAbrangenciaFiscal';
import ConfiguracaoFiscalSection from './sections/SecaoConfiguracaoFiscal';

interface FormStep2FiscalProps {
  data: Step2DataFiscal;
  formData: FormDataFiscal;
  onUpdate: (data: Partial<Step2DataFiscal>) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const FormularioComplyFiscal2: React.FC<FormStep2FiscalProps> = ({ 
  data, 
  formData, 
  onUpdate, 
  onPrev, 
  onSubmit 
}) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.segmento) {
      newErrors.segmento = 'Selecione o segmento da empresa';
    }

    if (data.escopo.length === 0) {
      newErrors.escopo = 'Selecione pelo menos uma opção de escopo';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    
    try {
      const completeFormData: FormDataFiscal = { ...formData, ...data };
      const isSondaUser = isSondaEmail(formData.email);

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!isSondaUser) {
        // Outros domínios - submeter para aprovação
        const quoteId = await approvalService.submitForApproval(completeFormData as any, 'comply_fiscal');
        console.log('Orçamento enviado para aprovação com ID:', quoteId);
      } else {
        // Email @sonda.com - enviar diretamente via webhook
        console.log('E-mail @sonda.com detectado - enviando orçamento diretamente');
        await approvalService.sendQuoteDirectly(completeFormData, 'comply_fiscal');
      }
      
      // Mostrar toast de sucesso
      toast({
        title: "Orçamento Enviado",
        description: "Seu orçamento está sendo processado e será enviado por email em instantes.",
        variant: "default",
      });
      
      // Aguardar um pouco para mostrar o toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit();
    } catch (error) {
      console.error('Erro ao processar orçamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (data[field as keyof Step2DataFiscal] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onUpdate({ [field]: newArray });
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
          <SegmentSelectorFiscal 
            value={data.segmento}
            onChange={(value) => onUpdate({ segmento: value as any })}
            error={errors.segmento}
          />

          <ScopeSelectorFiscal
            escopo={data.escopo}
            onCheckboxChange={handleCheckboxChange}
            error={errors.escopo}
          />

          <AbrangenciaFiscalSection
            quantidadeEmpresas={data.quantidadeEmpresas}
            quantidadeUfs={data.quantidadeUfs}
            onUpdate={handleFieldUpdate}
          />

          <ConfiguracaoFiscalSection
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
              disabled={isSubmitting}
              className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Gerar Orçamento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioComplyFiscal2;