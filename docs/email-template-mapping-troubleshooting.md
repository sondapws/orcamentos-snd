# Email Template Mapping - Guia de Troubleshooting

## Visão Geral

Este guia fornece soluções para problemas comuns encontrados ao usar o sistema de mapeamento de templates de e-mail. Os problemas estão organizados por categoria e incluem sintomas, causas possíveis e soluções.

## Índice

1. [Problemas de Mapeamento](#problemas-de-mapeamento)
2. [Problemas de Fallback](#problemas-de-fallback)
3. [Problemas de Validação](#problemas-de-validação)
4. [Problemas de Performance](#problemas-de-performance)
5. [Problemas de Configuração](#problemas-de-configuração)
6. [Problemas de Integração](#problemas-de-integração)
7. [Debugging e Logs](#debugging-e-logs)
8. [Ferramentas de Diagnóstico](#ferramentas-de-diagnóstico)

---

## Problemas de Mapeamento

### 🔍 Template não encontrado para combinação específica

**Sintomas:**
- `findByMapping()` retorna `null`
- Mensagem: "Nenhum template encontrado para [formulário] + [modalidade]"

**Causas possíveis:**
1. Não existe template com a combinação exata
2. Template existe mas está inativo
3. Template não está marcado como `vinculado_formulario`
4. Valores de formulário/modalidade incorretos

**Soluções:**

```typescript
// 1. Verificar se o template existe
const template = await emailTemplateMappingService.getTemplateById('template-id');
if (!template) {
  console.log('Template não existe ou está inativo');
}

// 2. Listar todos os mapeamentos para verificar
const mappings = await emailTemplateMappingService.getMappingsList();
console.log('Mapeamentos existentes:', mappings);

// 3. Usar findWithFallback() em vez de findByMapping()
const result = await emailTemplateMappingService.findWithFallback(
  'comply_fiscal',
  'on-premise'
);
```

**Verificação no banco:**
```sql
-- Verificar templates existentes
SELECT id, nome, formulario, modalidade, ativo, vinculado_formulario 
FROM email_templates 
WHERE formulario = 'comply_fiscal' AND modalidade = 'on-premise';

-- Verificar se há templates inativos
SELECT id, nome, formulario, modalidade, ativo 
FROM email_templates 
WHERE formulario = 'comply_fiscal' AND modalidade = 'on-premise' AND ativo = false;
```

### 🔍 Mapeamento duplicado

**Sintomas:**
- Erro: "Já existe um template para esta combinação"
- `validateUniqueness()` retorna `false`
- `EmailTemplateError` com código `DUPLICATE_MAPPING`

**Causas possíveis:**
1. Tentativa de criar mapeamento duplicado
2. Template existente não foi considerado na validação
3. Problema na validação de exclusão durante edição

**Soluções:**

```typescript
// 1. Verificar mapeamentos existentes antes de criar
const isUnique = await emailTemplateMappingService.validateUniqueness(
  'comply_fiscal',
  'on-premise'
);

if (!isUnique) {
  console.log('Já existe mapeamento para esta combinação');
  
  // Listar mapeamentos existentes
  const mappings = await emailTemplateMappingService.getMappingsList();
  const existing = mappings.find(m => 
    m.formulario === 'comply_fiscal' && m.modalidade === 'on-premise'
  );
  console.log('Mapeamento existente:', existing);
}

// 2. Para edição, usar excludeId
const isUniqueForEdit = await emailTemplateMappingService.validateUniqueness(
  'comply_fiscal',
  'on-premise',
  'template-id-being-edited'
);
```

### 🔍 Template encontrado mas com dados incorretos

**Sintomas:**
- Template é encontrado mas tem conteúdo inesperado
- Campos `formulario` ou `modalidade` não correspondem ao esperado

**Causas possíveis:**
1. Dados inconsistentes no banco
2. Cache desatualizado
3. Problema na migração de dados

**Soluções:**

```typescript
// 1. Verificar dados do template
const template = await emailTemplateMappingService.findByMapping(
  'comply_fiscal',
  'on-premise'
);

if (template) {
  console.log('Dados do template:', {
    id: template.id,
    nome: template.nome,
    formulario: template.formulario,
    modalidade: template.modalidade,
    ativo: template.ativo,
    vinculado_formulario: template.vinculado_formulario
  });
}

// 2. Limpar cache se aplicável
// (implementar se cache for adicionado no futuro)

// 3. Recriar mapeamento se necessário
```

---

## Problemas de Fallback

### 🔍 Sistema de fallback não funciona

**Sintomas:**
- `findWithFallback()` retorna `null` mesmo com templates disponíveis
- Fallback não segue a hierarquia esperada
- Mensagem: "Nenhum template encontrado em toda a hierarquia de fallback"

**Causas possíveis:**
1. Configuração de fallback incorreta
2. Templates de fallback inativos
3. Configuração `failWhenNoTemplateFound` habilitada

**Soluções:**

```typescript
// 1. Verificar configuração atual
const config = emailTemplateMappingService.getFallbackConfig();
console.log('Configuração de fallback:', config);

// 2. Verificar se templates padrão existem
if (config.defaultTemplates?.comply_fiscal) {
  const defaultTemplate = await emailTemplateMappingService.getTemplateById(
    config.defaultTemplates.comply_fiscal
  );
  console.log('Template padrão fiscal:', defaultTemplate);
}

// 3. Habilitar logs para debug
emailTemplateMappingService.updateFallbackConfig({
  enableLogging: true,
  logFallbackUsage: true,
  logMappingNotFound: true
});

// 4. Testar cada nível de fallback
const result = await emailTemplateMappingService.findWithFallback(
  'comply_fiscal',
  'on-premise'
);
console.log('Resultado do fallback:', result);
```

### 🔍 Fallback usando template incorreto

**Sintomas:**
- Fallback funciona mas usa template inesperado
- `fallbackType` não corresponde ao esperado

**Causas possíveis:**
1. Hierarquia de fallback mal compreendida
2. Templates padrão configurados incorretamente
3. Múltiplos templates ativos causando seleção inesperada

**Soluções:**

```typescript
// 1. Entender a hierarquia de fallback
console.log('Hierarquia de fallback:');
console.log('1. Template específico (formulario + modalidade)');
console.log('2. Template padrão configurado');
console.log('3. Template padrão do formulário (modalidade null)');
console.log('4. Qualquer template ativo (se habilitado)');
console.log('5. Template global de fallback');

// 2. Verificar cada nível
const config = emailTemplateMappingService.getFallbackConfig();

// Verificar template padrão configurado
if (config.defaultTemplates?.comply_fiscal) {
  const configuredDefault = await emailTemplateMappingService.getTemplateById(
    config.defaultTemplates.comply_fiscal
  );
  console.log('Template padrão configurado:', configuredDefault);
}

// Verificar template padrão do formulário
const { data } = await supabase
  .from('email_templates')
  .select('*')
  .eq('formulario', 'comply_fiscal')
  .is('modalidade', null)
  .eq('ativo', true)
  .eq('vinculado_formulario', true);
console.log('Templates padrão do formulário:', data);
```

### 🔍 Template global de fallback não funciona

**Sintomas:**
- Sistema não usa template global mesmo quando configurado
- Erro mesmo com `globalFallbackTemplate` definido

**Causas possíveis:**
1. Template global inativo ou inexistente
2. Configuração não foi salva corretamente
3. Template global não é adequado para o contexto

**Soluções:**

```typescript
// 1. Verificar configuração global
const config = emailTemplateMappingService.getFallbackConfig();
console.log('Template global configurado:', config.globalFallbackTemplate);

// 2. Verificar se template global existe
if (config.globalFallbackTemplate) {
  const globalTemplate = await emailTemplateMappingService.getTemplateById(
    config.globalFallbackTemplate
  );
  console.log('Template global:', globalTemplate);
  
  if (!globalTemplate) {
    console.error('Template global não encontrado ou inativo');
    
    // Reconfigurar com template válido
    await emailTemplateMappingService.setGlobalFallbackTemplate('valid-template-id');
  }
}

// 3. Testar configuração
const success = await emailTemplateMappingService.setGlobalFallbackTemplate('test-template-id');
console.log('Configuração global bem-sucedida:', success);
```

---

## Problemas de Validação

### 🔍 Validação em tempo real não funciona

**Sintomas:**
- Hook `useTemplateMappingValidation` não valida automaticamente
- `isValidating` sempre `false`
- Validação não é executada quando valores mudam

**Causas possíveis:**
1. `autoValidate` desabilitado
2. Dependências do `useEffect` incorretas
3. Valores inválidos não disparam validação

**Soluções:**

```typescript
// 1. Verificar configuração do hook
const {
  validateMapping,
  isValidating,
  validationState
} = useTemplateMappingValidation({
  autoValidate: true, // Certificar que está habilitado
  validationDelay: 500,
  showToasts: true
});

// 2. Verificar se valores são válidos
useEffect(() => {
  console.log('Valores para validação:', { formulario, modalidade, templateId });
  
  if (formulario && modalidade && templateId) {
    validateMapping({ formulario, modalidade, templateId });
  }
}, [formulario, modalidade, templateId, validateMapping]);

// 3. Validar manualmente se necessário
const handleManualValidation = async () => {
  const result = await validateMapping({
    formulario: 'comply_fiscal',
    modalidade: 'on-premise',
    templateId: 'test-id'
  });
  console.log('Resultado da validação manual:', result);
};
```

### 🔍 Validação retorna resultado incorreto

**Sintomas:**
- `validateUniqueness()` retorna `true` quando deveria ser `false`
- Validação permite duplicatas
- Erro de validação inconsistente

**Causas possíveis:**
1. Problema na consulta de banco
2. `excludeId` não está sendo usado corretamente
3. Cache de validação desatualizado

**Soluções:**

```typescript
// 1. Testar validação diretamente
const isUnique = await emailTemplateMappingService.validateUniqueness(
  'comply_fiscal',
  'on-premise'
);
console.log('Resultado da validação:', isUnique);

// 2. Verificar no banco manualmente
const { data } = await supabase
  .from('email_templates')
  .select('id, nome')
  .eq('formulario', 'comply_fiscal')
  .eq('modalidade', 'on-premise')
  .eq('ativo', true)
  .eq('vinculado_formulario', true);
console.log('Templates existentes no banco:', data);

// 3. Testar com excludeId
const isUniqueWithExclusion = await emailTemplateMappingService.validateUniqueness(
  'comply_fiscal',
  'on-premise',
  'existing-template-id'
);
console.log('Validação com exclusão:', isUniqueWithExclusion);
```

---

## Problemas de Performance

### 🔍 Consultas lentas

**Sintomas:**
- `findByMapping()` demora muito para responder
- Interface trava durante validação
- Timeout em consultas

**Causas possíveis:**
1. Índices de banco não estão sendo usados
2. Muitos templates inativos na tabela
3. Consultas não otimizadas

**Soluções:**

```sql
-- 1. Verificar se índices existem
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'email_templates';

-- 2. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_email_templates_mapping 
ON public.email_templates(formulario, modalidade) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_email_templates_formulario 
ON public.email_templates(formulario) 
WHERE ativo = true AND vinculado_formulario = true;

-- 3. Analisar plano de execução
EXPLAIN ANALYZE 
SELECT * FROM email_templates 
WHERE formulario = 'comply_fiscal' 
  AND modalidade = 'on-premise' 
  AND ativo = true 
  AND vinculado_formulario = true;
```

```typescript
// 4. Implementar cache se necessário
const cache = new Map();

const cachedFindByMapping = async (formulario, modalidade) => {
  const key = `${formulario}-${modalidade}`;
  
  if (cache.has(key)) {
    console.log('Usando cache para:', key);
    return cache.get(key);
  }
  
  const result = await emailTemplateMappingService.findByMapping(formulario, modalidade);
  cache.set(key, result);
  
  // Limpar cache após 5 minutos
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return result;
};
```

### 🔍 Muitas consultas simultâneas

**Sintomas:**
- Erro de conexão com banco
- "Too many connections"
- Performance degradada

**Causas possíveis:**
1. Muitas validações simultâneas
2. Vazamento de conexões
3. Pool de conexões mal configurado

**Soluções:**

```typescript
// 1. Implementar debounce para validações
import { debounce } from 'lodash';

const debouncedValidation = debounce(async (options) => {
  return await emailTemplateMappingService.validateUniqueness(
    options.formulario,
    options.modalidade,
    options.excludeId
  );
}, 500);

// 2. Usar batch de consultas quando possível
const validateMultipleMappings = async (mappings) => {
  const results = await Promise.all(
    mappings.map(mapping => 
      emailTemplateMappingService.validateUniqueness(
        mapping.formulario,
        mapping.modalidade,
        mapping.excludeId
      )
    )
  );
  return results;
};

// 3. Implementar retry com backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

---

## Problemas de Configuração

### 🔍 Configuração não persiste

**Sintomas:**
- Configurações são perdidas após reload
- `updateFallbackConfig()` não tem efeito permanente
- Templates padrão não são salvos

**Causas possíveis:**
1. Configuração é apenas em memória
2. Problema na persistência
3. Configuração sendo sobrescrita

**Soluções:**

```typescript
// 1. Verificar se configuração está sendo salva
const config = emailTemplateMappingService.getFallbackConfig();
console.log('Configuração atual:', config);

emailTemplateMappingService.updateFallbackConfig({
  enableLogging: true
});

const updatedConfig = emailTemplateMappingService.getFallbackConfig();
console.log('Configuração após update:', updatedConfig);

// 2. Implementar persistência se necessário
const saveConfigToStorage = (config) => {
  localStorage.setItem('emailTemplateFallbackConfig', JSON.stringify(config));
};

const loadConfigFromStorage = () => {
  const saved = localStorage.getItem('emailTemplateFallbackConfig');
  return saved ? JSON.parse(saved) : null;
};

// 3. Verificar se configuração é carregada na inicialização
const initializeConfig = () => {
  const savedConfig = loadConfigFromStorage();
  if (savedConfig) {
    emailTemplateMappingService.updateFallbackConfig(savedConfig);
  }
};
```

### 🔍 Templates padrão não são aplicados

**Sintomas:**
- `setDefaultTemplate()` retorna `true` mas template não é usado
- Fallback não usa template configurado como padrão

**Causas possíveis:**
1. Template configurado está inativo
2. Configuração não foi aplicada corretamente
3. Hierarquia de fallback não está sendo seguida

**Soluções:**

```typescript
// 1. Verificar se template padrão existe e está ativo
const checkDefaultTemplate = async (formulario) => {
  const config = emailTemplateMappingService.getFallbackConfig();
  const defaultTemplateId = config.defaultTemplates?.[formulario];
  
  if (defaultTemplateId) {
    const template = await emailTemplateMappingService.getTemplateById(defaultTemplateId);
    console.log(`Template padrão para ${formulario}:`, template);
    
    if (!template) {
      console.error(`Template padrão ${defaultTemplateId} não encontrado ou inativo`);
      return false;
    }
    return true;
  }
  
  console.log(`Nenhum template padrão configurado para ${formulario}`);
  return false;
};

// 2. Testar configuração
const testDefaultTemplate = async () => {
  const success = await emailTemplateMappingService.setDefaultTemplate(
    'comply_fiscal',
    'valid-template-id'
  );
  
  if (success) {
    // Testar se é usado no fallback
    const result = await emailTemplateMappingService.findWithFallback(
      'comply_fiscal',
      'non-existent-modalidade'
    );
    
    console.log('Resultado do teste de fallback:', result);
  }
};
```

---

## Problemas de Integração

### 🔍 Hook não funciona em componente React

**Sintomas:**
- `useEmailTemplateMapping` não retorna dados
- `loading` sempre `true`
- Erro: "Hook called outside of component"

**Causas possíveis:**
1. Hook usado fora de componente React
2. Problema na inicialização do Supabase
3. Contexto não configurado corretamente

**Soluções:**

```typescript
// 1. Verificar se está sendo usado dentro de componente
const MyComponent: React.FC = () => {
  const { findByMapping, loading, error } = useEmailTemplateMapping();
  
  useEffect(() => {
    console.log('Hook state:', { loading, error });
  }, [loading, error]);
  
  return <div>Component content</div>;
};

// 2. Verificar inicialização do Supabase
import { supabase } from '@/integrations/supabase/client';

const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('count')
      .limit(1);
    
    console.log('Supabase connection test:', { data, error });
  } catch (error) {
    console.error('Supabase connection failed:', error);
  }
};

// 3. Usar hook corretamente
const FormComponent: React.FC = () => {
  const { findWithFallback, loading } = useEmailTemplateMapping();
  
  const handleSubmit = async () => {
    if (loading) {
      console.log('Still loading, please wait');
      return;
    }
    
    try {
      const result = await findWithFallback('comply_fiscal', 'on-premise');
      console.log('Template found:', result);
    } catch (error) {
      console.error('Error finding template:', error);
    }
  };
  
  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Loading...' : 'Submit'}
    </button>
  );
};
```

### 🔍 Integração com formulários não funciona

**Sintomas:**
- Template não é identificado automaticamente
- Formulário não consegue determinar modalidade
- Erro na identificação do contexto

**Causas possíveis:**
1. Lógica de identificação incorreta
2. Valores de formulário/modalidade inválidos
3. Contexto não disponível

**Soluções:**

```typescript
// 1. Implementar identificação robusta
const identifyFormContext = (): { formulario: string | null, modalidade: string | null } => {
  // Baseado na URL
  const pathname = window.location.pathname;
  let formulario = null;
  
  if (pathname.includes('comply-fiscal')) {
    formulario = 'comply_fiscal';
  } else if (pathname.includes('comply-edocs')) {
    formulario = 'comply_edocs';
  }
  
  // Baseado em parâmetros ou estado
  const urlParams = new URLSearchParams(window.location.search);
  const modalidade = urlParams.get('modalidade') || 
                    localStorage.getItem('selectedModalidade');
  
  console.log('Context identified:', { formulario, modalidade });
  return { formulario, modalidade };
};

// 2. Validar valores antes de usar
const validateFormContext = (formulario: string, modalidade: string): boolean => {
  const validFormularios = ['comply_fiscal', 'comply_edocs'];
  const validModalidades = ['on-premise', 'saas'];
  
  if (!validFormularios.includes(formulario)) {
    console.error('Formulário inválido:', formulario);
    return false;
  }
  
  if (!validModalidades.includes(modalidade)) {
    console.error('Modalidade inválida:', modalidade);
    return false;
  }
  
  return true;
};

// 3. Implementar fallback para identificação
const getFormContextWithFallback = () => {
  const context = identifyFormContext();
  
  // Fallback para valores padrão se não conseguir identificar
  return {
    formulario: context.formulario || 'comply_fiscal',
    modalidade: context.modalidade || 'on-premise'
  };
};
```

---

## Debugging e Logs

### 🔍 Habilitar logs detalhados

```typescript
// Habilitar todos os logs
emailTemplateMappingService.updateFallbackConfig({
  enableLogging: true,
  logFallbackUsage: true,
  logMappingNotFound: true
});

// Logs aparecerão no console:
// [EmailTemplateMapping] Buscando template para formulário: comply_fiscal, modalidade: on-premise
// [EmailTemplateMapping] Template encontrado: Template Fiscal (ID: abc123)
// [EmailTemplateMapping] 🔄 FALLBACK USADO: comply_fiscal+saas → Template Padrão (configured_default)
```

### 🔍 Verificar logs de auditoria

```typescript
// Os logs de auditoria são salvos automaticamente
// Você pode consultá-los para análise de problemas

// Exemplo de consulta de logs (implementar conforme sua estrutura)
const checkAuditLogs = async () => {
  // Consultar logs de erro
  console.log('Verificando logs de auditoria...');
  
  // Logs de template não encontrado
  // Logs de fallback usado
  // Logs de erro de validação
  // Logs de performance
};
```

### 🔍 Testar componentes isoladamente

```typescript
// Testar serviço diretamente
const testService = async () => {
  console.log('=== Teste do Serviço ===');
  
  try {
    // Teste 1: Busca específica
    const specific = await emailTemplateMappingService.findByMapping(
      'comply_fiscal',
      'on-premise'
    );
    console.log('1. Busca específica:', specific);
    
    // Teste 2: Busca com fallback
    const fallback = await emailTemplateMappingService.findWithFallback(
      'comply_fiscal',
      'on-premise'
    );
    console.log('2. Busca com fallback:', fallback);
    
    // Teste 3: Validação
    const validation = await emailTemplateMappingService.validateUniqueness(
      'comply_fiscal',
      'on-premise'
    );
    console.log('3. Validação:', validation);
    
    // Teste 4: Lista de mapeamentos
    const mappings = await emailTemplateMappingService.getMappingsList();
    console.log('4. Lista de mapeamentos:', mappings.length);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
};

// Executar teste
testService();
```

---

## Ferramentas de Diagnóstico

### 🔧 Script de diagnóstico completo

```typescript
/**
 * Script de diagnóstico para o sistema de mapeamento de templates
 */
const runDiagnostics = async () => {
  console.log('🔍 Iniciando diagnóstico do sistema de mapeamento...\n');
  
  try {
    // 1. Verificar configuração
    console.log('1. Verificando configuração...');
    const config = emailTemplateMappingService.getFallbackConfig();
    console.log('   Configuração atual:', config);
    
    // 2. Verificar conectividade com banco
    console.log('\n2. Verificando conectividade com banco...');
    const { data: testData, error: testError } = await supabase
      .from('email_templates')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('   ❌ Erro de conectividade:', testError);
    } else {
      console.log('   ✅ Conectividade OK');
    }
    
    // 3. Verificar índices
    console.log('\n3. Verificando índices...');
    // (implementar consulta de índices se necessário)
    
    // 4. Verificar mapeamentos existentes
    console.log('\n4. Verificando mapeamentos existentes...');
    const mappings = await emailTemplateMappingService.getMappingsList();
    console.log(`   Total de mapeamentos: ${mappings.length}`);
    
    mappings.forEach(mapping => {
      console.log(`   - ${mapping.formulario} + ${mapping.modalidade} → ${mapping.template?.nome} (${mapping.template?.ativo ? 'Ativo' : 'Inativo'})`);
    });
    
    // 5. Testar fallback
    console.log('\n5. Testando sistema de fallback...');
    const testCases = [
      { formulario: 'comply_fiscal', modalidade: 'on-premise' },
      { formulario: 'comply_fiscal', modalidade: 'saas' },
      { formulario: 'comply_edocs', modalidade: 'on-premise' },
      { formulario: 'comply_edocs', modalidade: 'saas' }
    ];
    
    for (const testCase of testCases) {
      const result = await emailTemplateMappingService.findWithFallback(
        testCase.formulario as any,
        testCase.modalidade as any
      );
      
      console.log(`   ${testCase.formulario} + ${testCase.modalidade}:`);
      console.log(`     Template: ${result.template?.nome || 'Nenhum'}`);
      console.log(`     Fallback: ${result.fallbackType || 'N/A'}`);
      console.log(`     Específico: ${result.mappingFound ? 'Sim' : 'Não'}`);
    }
    
    // 6. Verificar templates padrão
    console.log('\n6. Verificando templates padrão...');
    if (config.defaultTemplates) {
      for (const [formulario, templateId] of Object.entries(config.defaultTemplates)) {
        if (templateId) {
          const template = await emailTemplateMappingService.getTemplateById(templateId);
          console.log(`   ${formulario}: ${template ? template.nome : 'Template não encontrado'} (${templateId})`);
        }
      }
    }
    
    // 7. Verificar template global
    console.log('\n7. Verificando template global...');
    if (config.globalFallbackTemplate) {
      const globalTemplate = await emailTemplateMappingService.getTemplateById(
        config.globalFallbackTemplate
      );
      console.log(`   Global: ${globalTemplate ? globalTemplate.nome : 'Template não encontrado'} (${config.globalFallbackTemplate})`);
    } else {
      console.log('   Nenhum template global configurado');
    }
    
    console.log('\n✅ Diagnóstico concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro durante diagnóstico:', error);
  }
};

// Executar diagnóstico
runDiagnostics();
```

### 🔧 Verificação de saúde do sistema

```typescript
/**
 * Verificação rápida de saúde do sistema
 */
const healthCheck = async (): Promise<{
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Verificar se há mapeamentos
    const mappings = await emailTemplateMappingService.getMappingsList();
    if (mappings.length === 0) {
      issues.push('Nenhum mapeamento configurado');
      recommendations.push('Configure pelo menos um mapeamento básico');
    }
    
    // Verificar templates inativos
    const inactiveMappings = mappings.filter(m => !m.template?.ativo);
    if (inactiveMappings.length > 0) {
      issues.push(`${inactiveMappings.length} mapeamentos com templates inativos`);
      recommendations.push('Ative os templates ou remova os mapeamentos');
    }
    
    // Verificar configuração de fallback
    const config = emailTemplateMappingService.getFallbackConfig();
    if (!config.defaultTemplates || Object.keys(config.defaultTemplates).length === 0) {
      issues.push('Nenhum template padrão configurado');
      recommendations.push('Configure templates padrão para fallback');
    }
    
    // Verificar template global
    if (!config.globalFallbackTemplate) {
      issues.push('Nenhum template global de fallback configurado');
      recommendations.push('Configure um template global como último recurso');
    }
    
    // Determinar status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (issues.length > 0) {
      status = mappings.length === 0 ? 'error' : 'warning';
    }
    
    return { status, issues, recommendations };
    
  } catch (error) {
    return {
      status: 'error',
      issues: [`Erro durante verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
      recommendations: ['Verificar conectividade com banco de dados', 'Verificar configuração do sistema']
    };
  }
};

// Usar verificação de saúde
const checkSystemHealth = async () => {
  const health = await healthCheck();
  
  console.log(`Status do sistema: ${health.status.toUpperCase()}`);
  
  if (health.issues.length > 0) {
    console.log('\nProblemas encontrados:');
    health.issues.forEach(issue => console.log(`- ${issue}`));
  }
  
  if (health.recommendations.length > 0) {
    console.log('\nRecomendações:');
    health.recommendations.forEach(rec => console.log(`- ${rec}`));
  }
};
```

---

## Contato e Suporte

Se você não conseguir resolver o problema usando este guia:

1. **Verifique os logs**: Habilite logs detalhados e analise as mensagens
2. **Execute o diagnóstico**: Use o script de diagnóstico completo
3. **Teste isoladamente**: Teste cada componente separadamente
4. **Consulte a documentação**: Revise o guia do desenvolvedor
5. **Verifique exemplos**: Compare com os exemplos de código fornecidos

### Informações úteis para suporte

Ao reportar problemas, inclua:

- Versão do sistema
- Configuração atual (`getFallbackConfig()`)
- Logs de erro completos
- Resultado do diagnóstico
- Passos para reproduzir o problema
- Comportamento esperado vs. atual

### Logs importantes

```typescript
// Coletar informações para suporte
const collectSupportInfo = async () => {
  const info = {
    timestamp: new Date().toISOString(),
    config: emailTemplateMappingService.getFallbackConfig(),
    mappingsCount: (await emailTemplateMappingService.getMappingsList()).length,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('Informações para suporte:', JSON.stringify(info, null, 2));
  return info;
};
```