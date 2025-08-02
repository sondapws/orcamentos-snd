# Sistema de Fallback de Templates de E-mail

## Visão Geral

O sistema de fallback de templates de e-mail foi implementado para garantir que sempre haja um template disponível para envio de e-mails, mesmo quando não existe um mapeamento específico para a combinação formulário + modalidade.

## Hierarquia de Fallback

O sistema segue uma hierarquia específica na busca por templates:

1. **Template Específico** - Template configurado para a combinação exata de formulário + modalidade
2. **Template Padrão Configurado** - Template definido como padrão para o formulário específico
3. **Template Padrão do Formulário** - Template do formulário com modalidade `null`
4. **Qualquer Template Ativo** - Qualquer template ativo do formulário (se habilitado)
5. **Template Global de Fallback** - Template configurado como fallback global (se definido)
6. **Nenhum Template** - Retorna `null` ou lança erro (dependendo da configuração)

## Configuração

### Configuração Básica

```typescript
import { emailTemplateFallbackConfigManager } from '@/config/emailTemplateConfig';

// Configurar template padrão para um formulário
emailTemplateFallbackConfigManager.setDefaultTemplate('comply_fiscal', 'template-id-fiscal');
emailTemplateFallbackConfigManager.setDefaultTemplate('comply_edocs', 'template-id-edocs');

// Configurar template global de fallback
emailTemplateFallbackConfigManager.setGlobalFallbackTemplate('template-global-id');
```

### Configuração de Comportamento

```typescript
// Atualizar configurações de comportamento
emailTemplateFallbackConfigManager.updateConfig({
  logging: {
    enabled: true,
    logFallbackUsage: true,
    logMappingNotFound: true
  },
  behavior: {
    useAnyActiveTemplateAsFallback: true,
    failWhenNoTemplateFound: false
  }
});
```

## Uso do Sistema

### Usando o Serviço Diretamente

```typescript
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';

// Buscar template com fallback
const result = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

if (result.template) {
  console.log(`Template encontrado: ${result.template.nome}`);
  console.log(`Tipo de fallback: ${result.fallbackType}`);
  console.log(`Motivo: ${result.fallbackReason}`);
} else {
  console.log('Nenhum template encontrado');
}
```

### Usando o Hook

```typescript
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';

const MyComponent = () => {
  const { findWithFallback, setDefaultTemplate } = useEmailTemplateMapping();

  const handleTest = async () => {
    const result = await findWithFallback('comply_fiscal', 'saas');
    // Resultado inclui informações sobre o tipo de fallback usado
  };

  const handleConfigureDefault = async () => {
    const success = await setDefaultTemplate('comply_fiscal', 'template-id');
    if (success) {
      console.log('Template padrão configurado');
    }
  };

  // ...
};
```

## Tipos de Fallback

### `specific`
Template específico encontrado para a combinação formulário + modalidade.

### `configured_default`
Template padrão configurado para o formulário foi usado.

### `form_default`
Template padrão do formulário (com modalidade `null`) foi usado.

### `any_active`
Qualquer template ativo do formulário foi usado como último recurso.

### `global_fallback`
Template global de fallback foi usado.

### `none`
Nenhum template foi encontrado em toda a hierarquia.

## Logging

O sistema inclui logging detalhado que pode ser configurado:

```typescript
// Habilitar logging completo
emailTemplateFallbackConfigManager.updateConfig({
  logging: {
    enabled: true,
    logFallbackUsage: true,      // Log quando fallback é usado
    logMappingNotFound: true     // Log quando mapeamento não é encontrado
  }
});
```

### Exemplos de Logs

```
[EmailTemplateMapping] Iniciando busca com fallback para comply_fiscal + on-premise
[EmailTemplateMapping] ❌ MAPEAMENTO NÃO ENCONTRADO: comply_fiscal+on-premise - iniciando processo de fallback
[EmailTemplateMapping] 🔄 FALLBACK USADO: comply_fiscal+on-premise → Template Padrão Fiscal (form_default) - Template padrão do formulário comply_fiscal (sem modalidade específica)
```

## Configuração de Templates Padrão

### Via Serviço

```typescript
// Configurar template padrão para formulário
const success = await emailTemplateMappingService.setDefaultTemplate('comply_fiscal', 'template-id');

// Configurar template global de fallback
const success = await emailTemplateMappingService.setGlobalFallbackTemplate('global-template-id');
```

### Via Configuração

```typescript
// Configuração direta
emailTemplateFallbackConfigManager.updateConfig({
  defaultTemplates: {
    comply_fiscal: 'template-fiscal-default',
    comply_edocs: 'template-edocs-default'
  },
  globalFallbackTemplate: 'template-global-fallback'
});
```

## Tratamento de Erros

O sistema pode ser configurado para falhar quando nenhum template é encontrado:

```typescript
emailTemplateFallbackConfigManager.updateConfig({
  behavior: {
    failWhenNoTemplateFound: true
  }
});

// Agora lançará EmailTemplateError se nenhum template for encontrado
try {
  const result = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');
} catch (error) {
  if (error instanceof EmailTemplateError) {
    console.error('Nenhum template encontrado:', error.message);
  }
}
```

## Testes

O sistema inclui testes abrangentes para todos os cenários de fallback:

```bash
# Executar testes do sistema de fallback
npm test -- src/test/services/emailTemplateFallback.test.ts

# Executar testes de configuração
npm test -- src/test/config/emailTemplateConfig.test.ts
```

## Exemplo Prático

Veja o arquivo `src/examples/EmailTemplateFallbackExample.tsx` para um exemplo completo de como usar o sistema de fallback em uma interface React.

## Migração

Para migrar do sistema anterior:

1. O método `findWithFallback` existente continua funcionando
2. Novos campos `fallbackType` e `fallbackReason` foram adicionados ao resultado
3. Configure templates padrão usando os novos métodos de configuração
4. Habilite logging para monitorar o uso de fallback
5. Ajuste configurações de comportamento conforme necessário