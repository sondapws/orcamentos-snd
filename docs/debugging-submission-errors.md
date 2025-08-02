# Debugging de Erros de Submissão de Orçamentos

## Problema Reportado

Ao tentar inserir um novo orçamento para o mesmo CNPJ, o seguinte erro é exibido:

```
Erro
Ocorreu um erro ao processar seu orçamento. Tente novamente.
```

## Possíveis Causas

### 1. Sistema de Idempotência
O sistema de idempotência pode estar marcando submissões como já processadas incorretamente.

**Verificação:**
```javascript
// No console do navegador
submissionIdempotency.getStats()
submissionIdempotency.listProcessed()
```

**Solução:**
```javascript
// Limpar estado de idempotência
submissionIdempotency.clear()
```

### 2. Sistema de Locks
Locks de submissão podem não estar sendo liberados corretamente.

**Verificação:**
- Verificar logs no console para mensagens de lock
- Aguardar 30 segundos (timeout padrão) e tentar novamente

### 3. Erro de Banco de Dados
Constraints ou índices únicos podem estar causando conflitos.

**Verificação:**
- Verificar logs detalhados no console
- Procurar por códigos de erro do PostgreSQL

### 4. Erro de Template
Problemas na busca ou processamento de templates de e-mail.

**Verificação:**
- Verificar se existem templates configurados
- Verificar logs de mapeamento de templates

## Script de Debug

Foi criado um script de debug em `src/scripts/debugSubmissionError.ts` que pode ser usado para investigar o problema:

```javascript
// No console do navegador
debugSubmissionError()    // Analisar estado atual
clearSystemState()        // Limpar estado do sistema
testMultipleSubmissions() // Testar submissões simultâneas
```

## Melhorias Implementadas

### 1. Logs Detalhados no ApprovalService
```typescript
// Logs detalhados de erro adicionados
console.error('Detalhes do erro:', {
  name: (error as any).name,
  message: (error as any).message,
  code: (error as any).code,
  details: (error as any).details,
  hint: (error as any).hint,
  stack: (error as any).stack?.split('\n').slice(0, 3)
});
```

### 2. Tratamento de Erro Específico nos Formulários
Agora os formulários mostram mensagens mais específicas:

- **Submissão Duplicada**: "Este orçamento já foi processado..."
- **Processamento em Andamento**: "Já existe uma submissão em andamento..."
- **Orçamento Duplicado**: "Este orçamento já foi processado anteriormente..."
- **Erro de Template**: "Não foi possível encontrar um template..."

### 3. Mensagens de Erro Mais Informativas
Para erros não categorizados, parte da mensagem original é exibida para facilitar o debug.

## Como Investigar o Problema

### Passo 1: Verificar Console
1. Abrir DevTools (F12)
2. Ir para a aba Console
3. Tentar submeter o orçamento
4. Verificar mensagens de erro detalhadas

### Passo 2: Executar Script de Debug
```javascript
// Executar no console
debugSubmissionError()
```

### Passo 3: Verificar Estado do Sistema
```javascript
// Verificar idempotência
submissionIdempotency.getStats()

// Verificar orçamentos pendentes
// (precisa estar logado como admin)
```

### Passo 4: Limpar Estado (se necessário)
```javascript
// Limpar apenas se confirmado que é problema de estado
clearSystemState()
```

## Cenários de Teste

### Teste 1: Mesmo CNPJ, Dados Diferentes
- Usar mesmo CNPJ mas alterar outros campos
- Deve funcionar normalmente

### Teste 2: Mesmo CNPJ, Dados Idênticos
- Usar exatamente os mesmos dados
- Deve ser bloqueado por idempotência

### Teste 3: Submissões Simultâneas
- Tentar submeter múltiplos orçamentos ao mesmo tempo
- Sistema de lock deve prevenir conflitos

## Monitoramento

### Logs a Observar
1. **Idempotência**: `🔒 Submissão já processada`
2. **Locks**: `Já existe uma submissão em andamento`
3. **Banco**: Códigos de erro PostgreSQL
4. **Templates**: Erros de mapeamento

### Métricas
- Taxa de erro por tipo
- Tempo de resposta das submissões
- Número de submissões duplicadas bloqueadas

## Próximos Passos

1. **Implementar telemetria**: Adicionar métricas detalhadas
2. **Melhorar UX**: Indicadores visuais de processamento
3. **Otimizar performance**: Reduzir tempo de resposta
4. **Alertas**: Notificações automáticas para erros críticos

## Contato para Suporte

Se o problema persistir após seguir este guia:

1. Executar `debugSubmissionError()` e copiar output
2. Incluir logs do console
3. Descrever passos para reproduzir
4. Informar dados utilizados (sem informações sensíveis)