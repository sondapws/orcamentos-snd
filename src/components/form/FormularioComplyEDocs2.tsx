
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Step2Data, FormData } from '@/types/formData';
import { useToast } from '@/hooks/use-toast';
import { useEmailTemplateMapping, FormContextProviderComponent } from '@/hooks/useEmailTemplateMapping';
import { approvalService } from '@/services/approvalService';
import { isSondaEmail } from '@/utils/emailValidation';
import { submissionIdempotency } from '@/utils/submissionIdempotency';
import SegmentSelector from './sections/SeletorSegmento';
import ScopeSelector from './sections/SeletorEscopo';
import AutomationSection from './sections/SecaoAutomacao';
import AbrangenciaSection from './sections/SecaoAbrangencia';
import ConfiguracaoSection from './sections/SecaoConfiguracao';

interface FormStep2Props {
  data: Step2Data;
  formData: FormData;
  onUpdate: (data: Partial<Step2Data>) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const FormularioComplyEDocs2: React.FC<FormStep2Props> = ({ data, formData, onUpdate, onPrev, onSubmit }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [quantidadePrefeiturasInbound, setQuantidadePrefeiturasInbound] = React.useState(0);
  const [quantidadePrefeiturasOutbound, setQuantidadePrefeiturasOutbound] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = React.useState<number>(0);
  const { toast } = useToast();
  const { findWithFallback, loading: templateLoading } = useEmailTemplateMapping();

  // Função para limpar erro específico quando campo é alterado
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiplas submissões
    if (isSubmitting || templateLoading) {
      console.log('Submissão já em andamento, ignorando...');
      return;
    }

    // Prevenir duplo clique (debounce de 3 segundos)
    const now = Date.now();
    if (now - lastSubmissionTime < 3000) {
      console.log('Duplo clique detectado, ignorando submissão');
      toast({
        title: "Aguarde",
        description: "Aguarde alguns segundos antes de tentar novamente.",
        variant: "default",
      });
      return;
    }

    if (!validateStep2()) return;

    setIsSubmitting(true);
    setLastSubmissionTime(now);
    
    try {
      const completeFormData: FormData = { ...formData, ...data };
      const isSondaUser = isSondaEmail(formData.email);

      // Verificar se existe template apropriado antes de processar
      console.log('Verificando template para formulário Comply e-DOCS, modalidade:', data.modalidade);
      
      const templateResult = await findWithFallback('comply_edocs', data.modalidade as 'on-premise' | 'saas');
      
      if (!templateResult.template) {
        console.error('Nenhum template encontrado para Comply e-DOCS + modalidade:', data.modalidade);
        toast({
          title: "Erro de Template",
          description: "Não foi possível encontrar um template de e-mail apropriado para esta configuração. Entre em contato com o suporte.",
          variant: "destructive",
        });
        return;
      }

      if (templateResult.isDefault && !templateResult.mappingFound) {
        console.log('Usando template padrão para Comply e-DOCS');
        toast({
          title: "Template Padrão",
          description: "Será usado o template padrão para este formulário.",
          variant: "default",
        });
      } else {
        console.log('Template específico encontrado:', templateResult.template.nome);
      }

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gerar ID único para idempotência
      const submissionId = submissionIdempotency.generateSubmissionId(completeFormData, 'comply_edocs');
      
      // Adicionar dados únicos para identificação
      const uniqueFormData = {
        ...completeFormData,
        submissionTimestamp: new Date().toISOString(),
        submissionId
      };

      if (!isSondaUser) {
        // Outros domínios - submeter para aprovação
        const quoteId = await approvalService.submitForApproval(uniqueFormData as any, 'comply_edocs');
        console.log('Orçamento enviado para aprovação com ID:', quoteId);
      } else {
        // Email @sonda.com - enviar diretamente via webhook
        console.log('E-mail @sonda.com detectado - enviando orçamento diretamente');
        await approvalService.sendQuoteDirectly(uniqueFormData, 'comply_edocs');
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
      
      // Tratamento específico para erros de template
      if (error instanceof Error && error.message.includes('template')) {
        toast({
          title: "Erro de Template",
          description: "Não foi possível encontrar um template de e-mail apropriado. Entre em contato com o suporte.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar seu orçamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (data[field as keyof Step2Data] as string[]) || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);

    onUpdate({ [field]: newArray });
    
    // Limpar erro de escopo quando qualquer checkbox for alterado
    if (field === 'escopoInbound' || field === 'escopoOutbound') {
      clearFieldError('escopo');
    }
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
    clearFieldError(field);
  };

  return (
    <FormContextProviderComponent 
      formulario="comply_edocs" 
      modalidade={data.modalidade as 'on-premise' | 'saas'}
    >
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
              onChange={(value) => {
                onUpdate({ segmento: value as any });
                clearFieldError('segmento');
              }}
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
                disabled={isSubmitting}
                className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || templateLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                size="lg"
              >
                {isSubmitting || templateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {templateLoading ? 'Verificando template...' : 'Processando...'}
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
    </FormContextProviderComponent>
  );
};

export default FormularioComplyEDocs2;
