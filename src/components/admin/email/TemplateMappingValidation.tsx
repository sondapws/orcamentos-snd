import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTemplateMappingValidation } from '@/hooks/useTemplateMappingValidation';

export interface TemplateMappingValidationProps {
  /** Formulário selecionado */
  formulario: 'comply_edocs' | 'comply_fiscal' | '';
  /** Modalidade selecionada */
  modalidade: string;
  /** ID do template a ser excluído da validação (para edição) */
  excludeId?: string;
  /** Se deve mostrar validação em tempo real */
  realTimeValidation?: boolean;
  /** Se deve mostrar toasts de erro */
  showToasts?: boolean;
  /** Callback chamado quando o estado de validação muda */
  onValidationChange?: (isValid: boolean, error?: string) => void;
  /** Classe CSS adicional */
  className?: string;
}

const TemplateMappingValidation: React.FC<TemplateMappingValidationProps> = ({
  formulario,
  modalidade,
  excludeId,
  realTimeValidation = true,
  showToasts = false, // Desabilitado por padrão para evitar spam de toasts
  onValidationChange,
  className = ''
}) => {
  const {
    validationState,
    isValidating,
    validateMapping,
    validateCombination,
    clearValidation,
    hasError,
    errorMessage,
    errorCode
  } = useTemplateMappingValidation({
    showToasts,
    autoValidate: realTimeValidation,
    validationDelay: 300
  });

  // Efeito para validação em tempo real
  useEffect(() => {
    if (!realTimeValidation) return;

    // Limpar validação se campos estão vazios
    if (!formulario || !modalidade) {
      clearValidation();
      onValidationChange?.(true);
      return;
    }

    // Validar apenas modalidades válidas
    const validModalidades = ['on-premise', 'saas'];
    if (!validModalidades.includes(modalidade)) {
      clearValidation();
      onValidationChange?.(true);
      return;
    }

    // Executar validação
    const runValidation = async () => {
      try {
        const result = await validateMapping({
          formulario: formulario as 'comply_edocs' | 'comply_fiscal',
          modalidade: modalidade as 'on-premise' | 'saas',
          excludeId
        });
        
        onValidationChange?.(result.isValid, result.error);
      } catch (error) {
        console.error('Erro durante validação em tempo real:', error);
        onValidationChange?.(false, 'Erro durante validação');
      }
    };

    runValidation();
  }, [formulario, modalidade, excludeId, realTimeValidation, validateMapping, clearValidation, onValidationChange]);

  // Função para validação manual (pode ser chamada externamente)
  const validateManually = async (): Promise<boolean> => {
    if (!formulario || !modalidade) {
      return true; // Consideramos válido se não há dados para validar
    }

    const validModalidades = ['on-premise', 'saas'];
    if (!validModalidades.includes(modalidade)) {
      return true; // Não validamos modalidades inválidas
    }

    const result = await validateMapping({
      formulario: formulario as 'comply_edocs' | 'comply_fiscal',
      modalidade: modalidade as 'on-premise' | 'saas',
      excludeId
    });

    onValidationChange?.(result.isValid, result.error);
    return result.isValid;
  };

  // Expor função de validação manual via ref (se necessário)
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    validate: validateManually
  }));

  // Não renderizar nada se não há dados para validar
  if (!formulario || !modalidade) {
    return null;
  }

  // Não renderizar para modalidades inválidas
  const validModalidades = ['on-premise', 'saas'];
  if (!validModalidades.includes(modalidade)) {
    return null;
  }

  // Obter labels amigáveis
  const getFormularioLabel = (form: string) => {
    return form === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal';
  };

  const getModalidadeLabel = (mod: string) => {
    return mod === 'on-premise' ? 'On-premisse' : 'SaaS';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Indicador de validação */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {getFormularioLabel(formulario)} + {getModalidadeLabel(modalidade)}
        </Badge>
        
        {isValidating && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            Validando...
          </div>
        )}
        
        {!isValidating && validationState.isValid && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Mapeamento válido
          </div>
        )}
      </div>

      {/* Alerta de erro */}
      {!isValidating && hasError && errorMessage && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {errorMessage}
            {errorCode && (
              <span className="ml-2 text-xs opacity-75">
                (Código: {errorCode})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Informações adicionais para debugging (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({
              formulario,
              modalidade,
              excludeId,
              validationState,
              isValidating
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default TemplateMappingValidation;