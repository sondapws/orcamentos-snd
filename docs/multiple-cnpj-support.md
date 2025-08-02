# Suporte a Múltiplos Orçamentos do Mesmo CNPJ

## Visão Geral

O sistema foi ajustado para permitir que a mesma empresa (mesmo CNPJ) possa enviar múltiplos orçamentos, mantendo a proteção contra duplo clique acidental.

## Cenários Suportados

### ✅ **Múltiplos Orçamentos Legítimos**

A mesma empresa pode solicitar orçamentos para:

1. **Diferentes Produtos**
   - Comply e-DOCS + Comply Fiscal
   - Cada produto gera orçamento separado

2. **Diferentes Modalidades**
   - On-premise + SaaS para o mesmo produto
   - Comparação de opções de implementação

3. **Diferentes Configurações**
   - Diferentes segmentos de negócio
   - Diferentes volumes de notas
   - Diferentes prazos de contratação

4. **Diferentes Responsáveis**
   - Diferentes departamentos da mesma empresa
   - Diferentes filiais ou unidades

### ❌ **Duplo Clique (Bloqueado)**

O sistema ainda bloqueia:
- Submissões idênticas em sequência rápida
- Duplo clique no mesmo formulário
- Tentativas de reenvio do mesmo orçamento

## Implementação Técnica

### Mudanças Realizadas

#### 1. Sistema de Locks
```typescript
// ANTES - Baseado em CNPJ (bloqueava múltiplos orçamentos)
const lockKey = `submit_${formData.cnpj}_${productType}`;

// DEPOIS - Baseado em submissionId (permite múltiplos)
const lockKey = `submit_${submissionId}`;
```

#### 2. Verificação no Banco
```typescript
// ANTES - Verificava CNPJ nos últimos 2 minutos
const duplicateQuote = recentQuotes.find(quote => 
  (quote.form_data as any)?.cnpj === formData.cnpj
);

// DEPOIS - Verifica apenas submissionId específico
const { data: existingQuote } = await supabase
  .from('pending_quotes')
  .select('id, submitted_at, form_data')
  .eq('form_data->>submissionId', submissionId);
```

#### 3. Geração de IDs Únicos
```typescript
// Cada submissão gera ID único baseado em:
// - Dados do formulário
// - Tipo de produto
// - Timestamp
// - Componente aleatório
const submissionId = submissionIdempotency.generateSubmissionId(formData, productType);
```

## Exemplos de Uso

### Exemplo 1: Empresa Comparando Modalidades
```
Empresa: TECH SOLUTIONS LTDA
CNPJ: 12.345.678/0001-95

Orçamento 1: Comply e-DOCS On-premise
Orçamento 2: Comply e-DOCS SaaS
Orçamento 3: Comply Fiscal On-premise

✅ Todos permitidos - 3 cards no painel de aprovações
```

### Exemplo 2: Diferentes Departamentos
```
Empresa: MULTINACIONAL S.A.
CNPJ: 98.765.432/0001-10

Orçamento 1: TI - Comply e-DOCS (João Silva)
Orçamento 2: Fiscal - Comply Fiscal (Maria Santos)
Orçamento 3: Jurídico - Comply e-DOCS (Pedro Costa)

✅ Todos permitidos - diferentes responsáveis
```

### Exemplo 3: Duplo Clique (Bloqueado)
```
Empresa: TESTE LTDA
CNPJ: 11.222.333/0001-44

Tentativa 1: Comply e-DOCS SaaS ✅ PERMITIDO
Tentativa 2: Comply e-DOCS SaaS (mesmo formulário) ❌ BLOQUEADO

Motivo: Mesmo submissionId detectado
```

## Benefícios da Mudança

### ✅ **Para o Negócio**
- **Flexibilidade**: Empresas podem solicitar múltiplos orçamentos
- **Comparação**: Facilita comparação entre modalidades/produtos
- **Departamentos**: Diferentes áreas podem solicitar orçamentos
- **Filiais**: Múltiplas unidades da mesma empresa

### ✅ **Para o Sistema**
- **Proteção mantida**: Duplo clique ainda é bloqueado
- **Performance**: Verificações mais eficientes
- **Escalabilidade**: Suporta mais cenários de uso
- **Rastreabilidade**: Cada orçamento tem ID único

### ✅ **Para o Usuário**
- **Sem bloqueios desnecessários**: Não há frustração por CNPJs "bloqueados"
- **Processo natural**: Fluxo intuitivo para múltiplas solicitações
- **Feedback claro**: Mensagens de erro mais específicas

## Proteções Mantidas

### 1. Sistema de Idempotência
- **ID único por submissão**: Cada formulário gera ID diferente
- **Verificação imediata**: Bloqueia submissões idênticas
- **Limpeza automática**: Remove IDs após 5 minutos

### 2. Debounce no Frontend
- **3 segundos**: Bloqueia cliques muito rápidos
- **Feedback visual**: Toast informativo ao usuário
- **Estado do botão**: Desabilitado durante processamento

### 3. Locks de Operação
- **Por submissão**: Lock específico para cada orçamento
- **Timeout automático**: Liberação após 30 segundos
- **Proteção de concorrência**: Evita conflitos de processamento

## Testes e Validação

### Scripts de Teste
```javascript
// Testar múltiplos orçamentos do mesmo CNPJ
testMultipleCNPJSubmissions();

// Simular fluxo completo
simulateMultipleQuotesFlow();

// Testar flexibilidade do sistema
testCNPJFlexibility();
```

### Cenários de Teste Manual

#### 1. Múltiplos Orçamentos Legítimos
1. Preencher formulário para Comply e-DOCS On-premise
2. Enviar orçamento
3. Aguardar limpeza do formulário
4. Preencher novamente para Comply e-DOCS SaaS
5. Enviar segundo orçamento
6. **Resultado esperado**: 2 cards no painel de aprovações

#### 2. Duplo Clique (Deve ser Bloqueado)
1. Preencher formulário completamente
2. Clicar rapidamente várias vezes em "Gerar Orçamento"
3. **Resultado esperado**: Apenas 1 card no painel

#### 3. Diferentes Produtos
1. Enviar orçamento para Comply e-DOCS
2. Enviar orçamento para Comply Fiscal (mesmo CNPJ)
3. **Resultado esperado**: 2 cards diferentes no painel

### Logs de Monitoramento

#### Logs de Sucesso
```
✅ Verificação de duplicatas passou - permitindo submissão para CNPJ: 12.345.678/0001-95
🔒 Submissão marcada como processada: [submissionId]
Orçamento inserido com sucesso: [quoteId]
```

#### Logs de Bloqueio (Duplo Clique)
```
🔒 Submissão já processada (idempotência): [submissionId]
❌ Este orçamento já foi processado
```

## Configurações

### Tempos de Limpeza
```typescript
// Sistema de idempotência
CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutos
MAX_AGE = 5 * 60 * 1000; // 5 minutos

// Debounce frontend
DEBOUNCE_TIME = 3000; // 3 segundos

// Lock timeout
LOCK_TIMEOUT = 30000; // 30 segundos
```

### Chaves de Identificação
```typescript
// Lock por submissão específica
lockKey = `submit_${submissionId}`;

// Verificação de duplicata exata
query = form_data->>submissionId = submissionId;
```

## Monitoramento e Métricas

### Métricas Importantes
- **Taxa de múltiplos orçamentos**: Quantos CNPJs enviam > 1 orçamento
- **Distribuição por produto**: e-DOCS vs Fiscal
- **Distribuição por modalidade**: On-premise vs SaaS
- **Taxa de bloqueio**: Duplo clique detectado e bloqueado

### Alertas Recomendados
- Muitos bloqueios por idempotência (possível problema UX)
- CNPJs com muitos orçamentos em pouco tempo (possível spam)
- Falhas na geração de submissionId

## Compatibilidade

### ✅ **Funcionalidades Mantidas**
- Sistema de templates de e-mail
- Painel de aprovações
- Notificações
- Auditoria e logs
- Envio direto para @sonda.com

### ✅ **Melhorias Adicionais**
- Performance melhorada (menos verificações)
- Flexibilidade aumentada
- Experiência do usuário aprimorada
- Suporte a casos de uso reais