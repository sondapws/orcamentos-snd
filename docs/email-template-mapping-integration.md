# Integração do Hook useEmailTemplateMapping

Este documento explica como integrar o hook `useEmailTemplateMapping` com os formulários existentes para automatizar a seleção de templates de e-mail.

## Visão Geral

O hook `useEmailTemplateMapping` fornece funcionalidades para:

1. **Identificação automática de contexto**: Detecta automaticamente o formulário e modalidade do contexto atual
2. **Cache local**: Evita consultas repetidas durante a sessão (cache de 5 minutos)
3. **Invalidação de cache**: Permite limpar o cache quando templates são modificados
4. **Sistema de fallback**: Usa template padrão quando não encontra mapeamento específico

## Funcionalidades Implementadas

### ✅ Identificação Automática de Contexto

```typescript
// Context Provider para envolver formulários
<FormContextProviderComponent formulario="comply_fiscal" modalidade="on-premise">
  <FormularioComplyFiscal2 />
</FormContextProviderComponent>

// Dentro do componente, usar o hook
const { findTemplateFromContext } = useEmailTemplateMapping();
const template = await findTemplateFromContext(); // Usa contexto automaticamente
```

### ✅ Cache Local Otimizado

```typescript
const { getMappingsList, clearCache, invalidateCache } = useEmailTemplateMapping();

// Cache automático - primeira chamada busca do servidor
const mappings1 = await getMappingsList(); // Busca do servidor

// Segunda chamada usa cache (se dentro de 5 minutos)
const mappings2 = await getMappingsList(); // Usa cache

// Limpar cache quando necessário
invalidateCache(); // Limpa cache para próxima consulta
```

### ✅ Métodos de Busca Flexíveis

```typescript
const {
  findByMapping,              // Busca específica com parâmetros
  findTemplateFromContext,    // Busca usando contexto atual
  findWithFallback,          // Busca com fallback manual
  findTemplateFromContextWithFallback // Busca com fallback do contexto
} = useEmailTemplateMapping();

// Busca manual
const template1 = await findByMapping('comply_fiscal', 'on-premise');

// Busca automática do contexto
const template2 = await findTemplateFromContext();

// Busca com fallback
const result = await findTemplateFromContextWithFallback();
// result = { template, isDefault, mappingFound }
```

## Como Integrar com Formulários Existentes

### 1. Envolver Formulário com Context Provider

```typescript
// Em FormularioComplyFiscal.tsx ou componente pai
import { FormContextProviderComponent } from '@/hooks/useEmailTemplateMapping';

const FormularioWrapper = () => {
  const [modalidade, setModalidade] = useState<'on-premise' | 'saas'>('on-premise');

  return (
    <FormContextProviderComponent 
      formulario="comply_fiscal" 
      modalidade={modalidade}
    >
      <FormularioComplyFiscal2 
        // ... outras props
        onModalidadeChange={setModalidade} // Atualizar contexto quando modalidade muda
      />
    </FormContextProviderComponent>
  );
};
```

### 2. Usar Hook no Formulário

```typescript
// Em FormularioComplyFiscal2.tsx
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';

const FormularioComplyFiscal2 = ({ onSubmit, ... }) => {
  const { findTemplateFromContextWithFallback, getCurrentContext } = useEmailTemplateMapping();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscar template baseado no contexto atual
    const templateResult = await findTemplateFromContextWithFallback();
    
    if (templateResult.template) {
      // Usar template encontrado para envio do e-mail
      await enviarEmail({
        template: templateResult.template,
        dados: formData,
        isDefault: templateResult.isDefault
      });
    } else {
      // Tratar caso onde não há template disponível
      console.error('Nenhum template encontrado para o contexto atual');
    }
    
    onSubmit();
  };

  // ... resto do componente
};
```

### 3. Integração com Serviço de E-mail

```typescript
// Em emailService.ts
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';

export const enviarEmailComTemplate = async (
  formulario: 'comply_edocs' | 'comply_fiscal',
  modalidade: 'on-premise' | 'saas',
  dadosFormulario: any
) => {
  const { findByMapping } = useEmailTemplateMapping();
  
  // Buscar template específico
  const template = await findByMapping(formulario, modalidade);
  
  if (template) {
    // Usar template específico
    return await enviarEmail({
      template: template.corpo,
      assunto: template.assunto,
      dados: dadosFormulario
    });
  } else {
    // Usar template padrão ou mostrar erro
    throw new Error(`Template não encontrado para ${formulario} + ${modalidade}`);
  }
};
```

## Exemplos de Uso

### Exemplo 1: Formulário Comply Fiscal

```typescript
// Wrapper do formulário
const ComplyFiscalWrapper = () => {
  const [step2Data, setStep2Data] = useState<Step2DataFiscal>({
    modalidade: 'on-premise',
    // ... outros campos
  });

  return (
    <FormContextProviderComponent 
      formulario="comply_fiscal" 
      modalidade={step2Data.modalidade}
    >
      <FormularioComplyFiscal2 
        data={step2Data}
        onUpdate={setStep2Data}
        onSubmit={handleSubmit}
      />
    </FormContextProviderComponent>
  );
};

// Dentro do formulário
const FormularioComplyFiscal2 = ({ data, onUpdate, onSubmit }) => {
  const { findTemplateFromContextWithFallback } = useEmailTemplateMapping();

  const handleSubmit = async () => {
    const templateResult = await findTemplateFromContextWithFallback();
    
    // Processar com template encontrado
    await processarOrcamento(data, templateResult.template);
    onSubmit();
  };

  const handleModalidadeChange = (novaModalidade: 'on-premise' | 'saas') => {
    onUpdate({ modalidade: novaModalidade });
    // O contexto será atualizado automaticamente pelo wrapper
  };

  // ... resto do componente
};
```

### Exemplo 2: Formulário Comply e-DOCS

```typescript
const ComplyEDocsWrapper = () => {
  const [step2Data, setStep2Data] = useState<Step2Data>({
    modalidade: 'saas',
    // ... outros campos
  });

  return (
    <FormContextProviderComponent 
      formulario="comply_edocs" 
      modalidade={step2Data.modalidade}
    >
      <FormularioComplyEDocs2 
        data={step2Data}
        onUpdate={setStep2Data}
        onSubmit={handleSubmit}
      />
    </FormContextProviderComponent>
  );
};
```

## Gerenciamento de Cache

### Invalidar Cache Quando Templates São Modificados

```typescript
// Em componente de administração de templates
const AdminTemplates = () => {
  const { invalidateCache } = useEmailTemplateMapping();

  const handleTemplateSaved = async (template: EmailTemplate) => {
    await salvarTemplate(template);
    
    // Invalidar cache para que próximas consultas busquem dados atualizados
    invalidateCache();
    
    toast({
      title: "Template salvo",
      description: "Cache atualizado automaticamente"
    });
  };

  // ... resto do componente
};
```

### Atualizar Cache Manualmente

```typescript
const { refreshMappings } = useEmailTemplateMapping();

// Forçar atualização do cache
await refreshMappings(); // Limpa cache e busca dados atualizados
```

## Tratamento de Erros

O hook trata automaticamente os erros e mostra toasts informativos:

```typescript
const { findTemplateFromContext } = useEmailTemplateMapping();

// Se contexto estiver incompleto
const template = await findTemplateFromContext();
// Mostra toast: "Contexto incompleto - Não foi possível identificar o formulário e modalidade"

// Se houver erro no serviço
// Mostra toast: "Erro ao buscar template - [mensagem do erro]"
```

## Utilitários Disponíveis

```typescript
const {
  getFormularioLabel,    // 'comply_fiscal' -> 'Comply Fiscal'
  getModalidadeLabel,    // 'on-premise' -> 'On-premise'
  getCurrentContext      // { formulario: 'comply_fiscal', modalidade: 'on-premise' }
} = useEmailTemplateMapping();

// Usar para exibição na interface
const contextoAtual = getCurrentContext();
console.log(`Contexto: ${getFormularioLabel(contextoAtual.formulario)} + ${getModalidadeLabel(contextoAtual.modalidade)}`);
```

## Próximos Passos

Para completar a integração:

1. **Atualizar FormularioComplyFiscal2.tsx** para usar o context provider
2. **Atualizar FormularioComplyEDocs2.tsx** para usar o context provider  
3. **Modificar approvalService** para usar o hook na busca de templates
4. **Adicionar invalidação de cache** nos componentes de administração
5. **Testar integração completa** com diferentes combinações de formulário + modalidade

## Benefícios da Implementação

- ✅ **Identificação automática**: Não precisa passar formulário/modalidade manualmente
- ✅ **Cache inteligente**: Reduz consultas desnecessárias ao banco
- ✅ **Invalidação controlada**: Cache é limpo quando templates são modificados
- ✅ **Fallback robusto**: Sistema funciona mesmo sem mapeamentos específicos
- ✅ **Tratamento de erros**: Feedback claro para o usuário
- ✅ **Flexibilidade**: Pode ser usado com ou sem contexto automático