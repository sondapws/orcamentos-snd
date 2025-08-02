# Email Template Mapping - API Reference

## Visão Geral

Esta documentação fornece referência completa da API do sistema de mapeamento de templates de e-mail, incluindo todas as interfaces, tipos, métodos e exemplos de uso.

## Índice

1. [Interfaces e Tipos](#interfaces-e-tipos)
2. [EmailTemplateMappingService](#emailtemplatemappingservice)
3. [Hooks React](#hooks-react)
4. [Utilitários de Validação](#utilitários-de-validação)
5. [Componentes UI](#componentes-ui)
6. [Configuração](#configuração)
7. [Tratamento de Erros](#tratamento-de-erros)

---

## Interfaces e Tipos

### EmailTemplate

```typescript
interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
  descricao?: string | null;
  tipo?: string | null;
  ativo: boolean;
  vinculado_formulario: boolean;
  formulario?: 'comply_edocs' | 'comply_fiscal' | null;
  modalidade?: string | null;
  created_at?: string;
  updated_at?: string;
}
```

### EmailTemplateMapping

```typescript
interface EmailTemplateMapping {
  formulario: 'comply_edocs' | 'comply_fiscal';
  modalidade: 'on-premise' | 'saas';
  templateId: string;
  template?: EmailTemplate;
}
```

### TemplateMappingResult

```typescript
interface TemplateMappingResult {
  template: EmailTemplate | null;
  isDefault: boolean;
  mappingFound: boolean;
  fallbackType?: 'specific' | 'configured_default' | 'form_default' | 'any_active' | 'global_fallback' | 'none';
  fallbackReason?: string;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
  details?: any;
}
```

### MappingValidationOptions

```typescript
interface MappingValidationOptions {
  formulario: 'comply_edocs' | 'comply_fiscal';
  modalidade: 'on-premise' | 'saas';
  templateId: string;
  excludeId?: string;
}
```

### EmailTemplateFallbackConfig

```typescript
interface EmailTemplateFallbackConfig {
  defaultTemplates?: {
    comply_fiscal?: string;
    comply_edocs?: string;
  };
  globalFallbackTemplate?: string;
  useAnyActiveTemplateAsFallback: boolean;
  failWhenNoTemplateFound: boolean;
  enableLogging: boolean;
  logFallbackUsage: boolean;
  logMappingNotFound: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}
```

---

## EmailTemplateMappingService

### Instância Singleton

```typescript
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
```

### Métodos

#### findByMapping()

Busca um template específico baseado na combinação formulário + modalidade.

```typescript
findByMapping(
  formulario: 'comply_edocs' | 'comply_fiscal',
  modalidade: 'on-premise' | 'saas'
): Promise<EmailTemplate | null>
```

**Parâmetros:**
- `formulario`: Tipo do formulário
- `modalidade`: Modalidade selecionada

**Retorno:**
- `Promise<EmailTemplate | null>`: Template específico ou null se não encontrado

**Exceções:**
- `EmailTemplateError`: Erro de banco de dados

**Exemplo:**
```typescript
const template = await emailTemplateMappingService.findByMapping(
  'comply_fiscal',
  'on-premise'
);

if (template) {
  console.log(`Template encontrado: ${template.nome}`);
} else {
  console.log('Nenhum template específico encontrado');
}
```

#### findWithFallback()

Busca template com sistema de fallback completo.

```typescript
findWithFallback(
  formulario: 'comply_edocs' | 'comply_fiscal',
  modalidade: 'on-premise' | 'saas'
): Promise<TemplateMappingResult>
```

**Parâmetros:**
- `formulario`: Tipo do formulário
- `modalidade`: Modalidade selecionada

**Retorno:**
- `Promise<TemplateMappingResult>`: Resultado com template e informações de fallback

**Exceções:**
- `EmailTemplateError`: Quando configurado para falhar e nenhum template é encontrado

**Exemplo:**
```typescript
const result = await emailTemplateMappingService.findWithFallback(
  'comply_edocs',
  'saas'
);

console.log('Template:', result.template?.nome);
console.log('É padrão:', result.isDefault);
console.log('Tipo de fallback:', result.fallbackType);

if (result.template) {
  // Usar template encontrado
  await sendEmailWithTemplate(result.template, emailData);
}
```

#### validateUniqueness()

Valida se já existe um mapeamento para a combinação formulário + modalidade.

```typescript
validateUniqueness(
  formulario: 'comply_edocs' | 'comply_fiscal',
  modalidade: 'on-premise' | 'saas',
  excludeId?: string
): Promise<boolean>
```

**Parâmetros:**
- `formulario`: Tipo do formulário
- `modalidade`: Modalidade selecionada
- `excludeId`: ID do template a ser excluído da validação (opcional)

**Retorno:**
- `Promise<boolean>`: true se a combinação é única, false se já existe

**Exceções:**
- `EmailTemplateError`: Erro de banco de dados ou duplicação

**Exemplo:**
```typescript
const isUnique = await emailTemplateMappingService.validateUniqueness(
  'comply_fiscal',
  'saas',
  'template-id-to-exclude'
);

if (!isUnique) {
  console.error('Já existe um template para esta combinação');
}
```

#### getMappingsList()

Lista todos os mapeamentos ativos no sistema.

```typescript
getMappingsList(): Promise<EmailTemplateMapping[]>
```

**Retorno:**
- `Promise<EmailTemplateMapping[]>`: Array com todos os mapeamentos existentes

**Exceções:**
- `EmailTemplateError`: Erro de banco de dados

**Exemplo:**
```typescript
const mappings = await emailTemplateMappingService.getMappingsList();

mappings.forEach(mapping => {
  console.log(`${mapping.formulario} + ${mapping.modalidade} → ${mapping.template?.nome}`);
});
```

#### setDefaultTemplate()

Configura template padrão para um formulário específico.

```typescript
setDefaultTemplate(
  formulario: 'comply_edocs' | 'comply_fiscal',
  templateId: string
): Promise<boolean>
```

**Parâmetros:**
- `formulario`: Tipo do formulário
- `templateId`: ID do template a ser usado como padrão

**Retorno:**
- `Promise<boolean>`: true se configurado com sucesso, false se template não existe

**Exemplo:**
```typescript
const success = await emailTemplateMappingService.setDefaultTemplate(
  'comply_fiscal',
  'template-fiscal-default-id'
);

if (success) {
  console.log('Template padrão configurado com sucesso');
}
```

#### setGlobalFallbackTemplate()

Configura template global de fallback.

```typescript
setGlobalFallbackTemplate(templateId: string): Promise<boolean>
```

**Parâmetros:**
- `templateId`: ID do template a ser usado como fallback global

**Retorno:**
- `Promise<boolean>`: true se configurado com sucesso, false se template não existe

**Exemplo:**
```typescript
const success = await emailTemplateMappingService.setGlobalFallbackTemplate(
  'template-global-fallback-id'
);

if (success) {
  console.log('Template global de fallback configurado');
}
```

#### getFallbackConfig()

Obtém configuração atual de fallback.

```typescript
getFallbackConfig(): EmailTemplateFallbackConfig
```

**Retorno:**
- `EmailTemplateFallbackConfig`: Configuração atual do sistema de fallback

**Exemplo:**
```typescript
const config = emailTemplateMappingService.getFallbackConfig();

console.log('Templates padrão:', config.defaultTemplates);
console.log('Template global:', config.globalFallbackTemplate);
console.log('Logs habilitados:', config.enableLogging);
```

#### updateFallbackConfig()

Atualiza configuração de fallback.

```typescript
updateFallbackConfig(config: Partial<EmailTemplateFallbackConfig>): void
```

**Parâmetros:**
- `config`: Nova configuração (parcial)

**Exemplo:**
```typescript
emailTemplateMappingService.updateFallbackConfig({
  enableLogging: true,
  logFallbackUsage: true,
  useAnyActiveTemplateAsFallback: false
});
```

#### getTemplateById()

Verifica se um template específico existe e está ativo.

```typescript
getTemplateById(templateId: string): Promise<EmailTemplate | null>
```

**Parâmetros:**
- `templateId`: ID do template a ser verificado

**Retorno:**
- `Promise<EmailTemplate | null>`: Template se encontrado e ativo, null caso contrário

**Exceções:**
- `EmailTemplateError`: Erro de banco de dados

**Exemplo:**
```typescript
const template = await emailTemplateMappingService.getTemplateById('template-id');

if (template) {
  console.log(`Template encontrado: ${template.nome}`);
  console.log(`Status: ${template.ativo ? 'Ativo' : 'Inativo'}`);
}
```

---

## Hooks React

### useEmailTemplateMapping

Hook principal para integração com componentes React.

```typescript
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';
```

**Retorno:**
```typescript
interface UseEmailTemplateMappingReturn {
  findByMapping: (formulario: string, modalidade: string) => Promise<EmailTemplate | null>;
  findWithFallback: (formulario: string, modalidade: string) => Promise<TemplateMappingResult>;
  validateUniqueness: (formulario: string, modalidade: string, excludeId?: string) => Promise<boolean>;
  getMappingsList: () => Promise<EmailTemplateMapping[]>;
  loading: boolean;
  error: string | null;
}
```

**Exemplo:**
```typescript
function MyComponent() {
  const { 
    findByMapping, 
    findWithFallback, 
    validateUniqueness,
    getMappingsList,
    loading,
    error 
  } = useEmailTemplateMapping();

  const handleFormSubmit = async (formulario, modalidade) => {
    const result = await findWithFallback(formulario, modalidade);
    
    if (result.template) {
      console.log('Usando template:', result.template.nome);
    }
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

### useTemplateMappingValidation

Hook para validação de mapeamentos em tempo real.

```typescript
import { useTemplateMappingValidation } from '@/hooks/useTemplateMappingValidation';
```

**Opções:**
```typescript
interface UseTemplateMappingValidationOptions {
  showToasts?: boolean;
  validationDelay?: number;
  autoValidate?: boolean;
}
```

**Retorno:**
```typescript
interface UseTemplateMappingValidationReturn {
  validationState: ValidationResult;
  isValidating: boolean;
  validationHistory: ValidationResult[];
  validateMapping: (options: MappingValidationOptions) => Promise<ValidationResult>;
  validateCombination: (formulario: string, modalidade: string) => ValidationResult;
  clearValidation: () => void;
  revalidate: () => Promise<void>;
  hasError: boolean;
  errorMessage: string | undefined;
  errorCode: string | undefined;
}
```

**Exemplo:**
```typescript
function TemplateForm() {
  const {
    validateMapping,
    validationState,
    isValidating,
    hasError,
    errorMessage
  } = useTemplateMappingValidation({
    showToasts: true,
    autoValidate: true,
    validationDelay: 500
  });

  const handleValidation = async () => {
    const result = await validateMapping({
      formulario: 'comply_fiscal',
      modalidade: 'on-premise',
      templateId: 'new-template-id'
    });

    if (result.isValid) {
      console.log('Mapeamento válido');
    }
  };

  return (
    <div>
      {isValidating && <p>Validando...</p>}
      {hasError && <p className="error">{errorMessage}</p>}
      <button onClick={handleValidation}>Validar</button>
    </div>
  );
}
```

---

## Utilitários de Validação

### validateMappingUniqueness()

Valida unicidade de mapeamento no banco de dados.

```typescript
import { validateMappingUniqueness } from '@/utils/templateMappingValidation';

validateMappingUniqueness(options: MappingValidationOptions): Promise<ValidationResult>
```

**Exemplo:**
```typescript
const result = await validateMappingUniqueness({
  formulario: 'comply_fiscal',
  modalidade: 'on-premise',
  templateId: 'template-id'
});

if (!result.isValid) {
  console.error('Mapeamento duplicado:', result.error);
}
```

### validateMappingCombination()

Valida combinação de formulário e modalidade localmente.

```typescript
import { validateMappingCombination } from '@/utils/templateMappingValidation';

validateMappingCombination(formulario: string, modalidade: string): ValidationResult
```

**Exemplo:**
```typescript
const result = validateMappingCombination('comply_fiscal', 'on-premise');

if (!result.isValid) {
  console.error('Combinação inválida:', result.error);
}
```

---

## Componentes UI

### TemplateMappingList

Componente para listar e gerenciar mapeamentos.

```typescript
import TemplateMappingList from '@/components/admin/email/TemplateMappingList';
```

**Props:**
```typescript
interface TemplateMappingListProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}
```

**Exemplo:**
```typescript
function AdminPanel() {
  return (
    <TemplateMappingList
      autoRefresh={true}
      refreshInterval={30000}
      className="my-custom-class"
    />
  );
}
```

### TestMappingDialog

Componente para testar mapeamentos.

```typescript
import TestMappingDialog from '@/components/admin/email/TestMappingDialog';
```

**Props:**
```typescript
interface TestMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: EmailTemplateMapping | null;
  defaultAdminEmail?: string;
}
```

**Exemplo:**
```typescript
function TestInterface() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);

  return (
    <TestMappingDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      mapping={selectedMapping}
      defaultAdminEmail="admin@empresa.com"
    />
  );
}
```

### TemplateMappingValidation

Componente para validação de mapeamentos.

```typescript
import TemplateMappingValidation from '@/components/admin/email/TemplateMappingValidation';
```

**Props:**
```typescript
interface TemplateMappingValidationProps {
  formulario: 'comply_edocs' | 'comply_fiscal';
  modalidade: 'on-premise' | 'saas';
  templateId: string;
  excludeId?: string;
  onValidationChange?: (result: ValidationResult) => void;
  showRealTimeValidation?: boolean;
}
```

---

## Configuração

### emailTemplateFallbackConfigManager

Gerenciador de configuração do sistema de fallback.

```typescript
import { emailTemplateFallbackConfigManager } from '@/config/emailTemplateConfig';
```

#### Métodos

##### getConfig()

```typescript
getConfig(): EmailTemplateFallbackConfig
```

##### updateConfig()

```typescript
updateConfig(config: Partial<EmailTemplateFallbackConfig>): void
```

##### setDefaultTemplate()

```typescript
setDefaultTemplate(formulario: 'comply_edocs' | 'comply_fiscal', templateId: string): void
```

##### getDefaultTemplate()

```typescript
getDefaultTemplate(formulario: 'comply_edocs' | 'comply_fiscal'): string | undefined
```

##### setGlobalFallbackTemplate()

```typescript
setGlobalFallbackTemplate(templateId: string): void
```

##### getGlobalFallbackTemplate()

```typescript
getGlobalFallbackTemplate(): string | undefined
```

##### isLoggingEnabled()

```typescript
isLoggingEnabled(): boolean
```

##### shouldLogFallbackUsage()

```typescript
shouldLogFallbackUsage(): boolean
```

##### shouldLogMappingNotFound()

```typescript
shouldLogMappingNotFound(): boolean
```

##### shouldUseAnyActiveTemplateAsFallback()

```typescript
shouldUseAnyActiveTemplateAsFallback(): boolean
```

##### shouldFailWhenNoTemplateFound()

```typescript
shouldFailWhenNoTemplateFound(): boolean
```

**Exemplo de uso:**
```typescript
// Configurar template padrão
emailTemplateFallbackConfigManager.setDefaultTemplate('comply_fiscal', 'template-id');

// Habilitar logs
emailTemplateFallbackConfigManager.updateConfig({
  enableLogging: true,
  logFallbackUsage: true
});

// Verificar configuração
const config = emailTemplateFallbackConfigManager.getConfig();
console.log('Configuração atual:', config);
```

---

## Tratamento de Erros

### EmailTemplateError

Classe de erro específica do sistema de templates.

```typescript
import { EmailTemplateError } from '@/errors/EmailTemplateError';
```

**Códigos de erro:**
- `DUPLICATE_MAPPING`: Mapeamento duplicado
- `TEMPLATE_NOT_FOUND`: Template não encontrado
- `INVALID_MAPPING`: Mapeamento inválido
- `DATABASE_ERROR`: Erro de banco de dados
- `VALIDATION_ERROR`: Erro de validação
- `SYSTEM_ERROR`: Erro do sistema

**Propriedades:**
```typescript
class EmailTemplateError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any);
}
```

**Exemplo de tratamento:**
```typescript
try {
  const template = await emailTemplateMappingService.findByMapping(
    'comply_fiscal',
    'on-premise'
  );
} catch (error) {
  if (error instanceof EmailTemplateError) {
    switch (error.code) {
      case 'DATABASE_ERROR':
        console.error('Erro de banco:', error.message);
        break;
      case 'TEMPLATE_NOT_FOUND':
        console.error('Template não encontrado:', error.message);
        break;
      default:
        console.error('Erro desconhecido:', error.message);
    }
  } else {
    console.error('Erro inesperado:', error);
  }
}
```

### EmailTemplateErrorFactory

Factory para criação de erros específicos.

```typescript
import { EmailTemplateErrorFactory } from '@/errors/EmailTemplateError';
```

#### Métodos

##### createDatabaseError()

```typescript
createDatabaseError(operation: string, originalError: any): EmailTemplateError
```

##### createDuplicateMappingError()

```typescript
createDuplicateMappingError(
  formulario: string, 
  modalidade: string, 
  existingTemplateId?: string
): EmailTemplateError
```

##### createTemplateNotFoundError()

```typescript
createTemplateNotFoundError(templateId: string): EmailTemplateError
```

##### createValidationError()

```typescript
createValidationError(message: string, details?: any): EmailTemplateError
```

##### createFallbackChainExhaustedError()

```typescript
createFallbackChainExhaustedError(
  formulario: string, 
  modalidade: string, 
  attemptedFallbacks: string[]
): EmailTemplateError
```

**Exemplo:**
```typescript
// Criar erro personalizado
const error = EmailTemplateErrorFactory.createDuplicateMappingError(
  'comply_fiscal',
  'on-premise',
  'existing-template-id'
);

throw error;
```

---

## Logs e Auditoria

### auditLogger

Serviço de logs de auditoria.

```typescript
import { auditLogger } from '@/services/auditLogger';
```

#### Métodos principais

##### logTemplateSearch()

```typescript
logTemplateSearch(
  formulario: string,
  modalidade: string,
  found: boolean,
  templateId?: string,
  usedFallback?: boolean,
  fallbackType?: string,
  duration?: number
): Promise<void>
```

##### logFallbackUsage()

```typescript
logFallbackUsage(
  formulario: string,
  modalidade: string,
  fallbackType: string,
  templateId: string,
  templateName: string,
  reason: string
): Promise<void>
```

##### logError()

```typescript
logError(
  operation: string,
  error: Error,
  context?: any
): Promise<void>
```

##### logOperation()

```typescript
logOperation(
  operation: string,
  entityType: string,
  entityData: any,
  status: 'success' | 'warning' | 'error',
  userId?: string,
  sessionId?: string,
  duration?: number
): Promise<void>
```

**Exemplo:**
```typescript
// Log personalizado
await auditLogger.logOperation(
  'custom_operation',
  'mapping',
  { customData: 'value' },
  'success'
);

// Log de erro
await auditLogger.logError(
  'template_search',
  new Error('Template não encontrado'),
  { formulario: 'comply_fiscal', modalidade: 'on-premise' }
);
```

---

## Constantes e Enums

### Tipos de Formulário

```typescript
type FormularioType = 'comply_edocs' | 'comply_fiscal';
```

### Tipos de Modalidade

```typescript
type ModalidadeType = 'on-premise' | 'saas';
```

### Tipos de Fallback

```typescript
type FallbackType = 
  | 'specific' 
  | 'configured_default' 
  | 'form_default' 
  | 'any_active' 
  | 'global_fallback' 
  | 'none';
```

### Status de Validação

```typescript
type ValidationStatus = 'success' | 'warning' | 'error';
```

---

## Exemplos Completos

### Integração Básica com Formulário

```typescript
import React, { useState } from 'react';
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';

const FormularioComply: React.FC = () => {
  const { findWithFallback, loading } = useEmailTemplateMapping();
  const [modalidade, setModalidade] = useState<'on-premise' | 'saas'>('on-premise');

  const handleSubmit = async (formData: any) => {
    try {
      const formulario = 'comply_fiscal'; // Identificar baseado no contexto
      
      const result = await findWithFallback(formulario, modalidade);
      
      if (result.template) {
        // Usar template para gerar e-mail
        await sendEmailWithTemplate(result.template, formData);
        
        if (result.isDefault) {
          console.warn(`Fallback usado: ${result.fallbackType}`);
        }
      } else {
        throw new Error('Nenhum template disponível');
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={modalidade} 
        onChange={(e) => setModalidade(e.target.value as any)}
      >
        <option value="on-premise">On-premise</option>
        <option value="saas">SaaS</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processando...' : 'Enviar'}
      </button>
    </form>
  );
};
```

### Validação em Tempo Real

```typescript
import React, { useState, useEffect } from 'react';
import { useTemplateMappingValidation } from '@/hooks/useTemplateMappingValidation';

const TemplateForm: React.FC = () => {
  const [formulario, setFormulario] = useState<'comply_fiscal'>('comply_fiscal');
  const [modalidade, setModalidade] = useState<'on-premise'>('on-premise');
  const [templateId, setTemplateId] = useState('');

  const {
    validateMapping,
    validationState,
    isValidating,
    hasError,
    errorMessage,
    clearValidation
  } = useTemplateMappingValidation({
    showToasts: true,
    autoValidate: true,
    validationDelay: 500
  });

  useEffect(() => {
    if (templateId) {
      validateMapping({ formulario, modalidade, templateId });
    } else {
      clearValidation();
    }
  }, [formulario, modalidade, templateId, validateMapping, clearValidation]);

  return (
    <div>
      <input
        type="text"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        placeholder="ID do template"
        className={hasError ? 'error' : ''}
      />
      
      {isValidating && <p>Validando...</p>}
      {hasError && <p className="error">{errorMessage}</p>}
      {validationState.isValid && templateId && (
        <p className="success">Mapeamento válido</p>
      )}
    </div>
  );
};
```

### Configuração Avançada

```typescript
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';

// Configurar sistema completo
const setupEmailTemplateMapping = async () => {
  // 1. Configurar templates padrão
  await emailTemplateMappingService.setDefaultTemplate(
    'comply_fiscal',
    'template-fiscal-default'
  );
  
  await emailTemplateMappingService.setDefaultTemplate(
    'comply_edocs',
    'template-edocs-default'
  );

  // 2. Configurar template global
  await emailTemplateMappingService.setGlobalFallbackTemplate(
    'template-global-fallback'
  );

  // 3. Configurar comportamentos
  emailTemplateMappingService.updateFallbackConfig({
    useAnyActiveTemplateAsFallback: true,
    failWhenNoTemplateFound: false,
    enableLogging: true,
    logFallbackUsage: true,
    logMappingNotFound: true
  });

  console.log('Sistema configurado com sucesso');
};

// Executar configuração
setupEmailTemplateMapping();
```

---

Esta documentação de API fornece referência completa para todos os aspectos do sistema de mapeamento de templates de e-mail. Para exemplos mais detalhados e casos de uso específicos, consulte o [Guia do Desenvolvedor](./email-template-mapping-developer-guide.md).