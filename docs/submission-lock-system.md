# Sistema de Prevenção de Duplicação de Submissões

## Visão Geral

O sistema de prevenção de duplicação foi implementado para resolver o problema de duplicação de orçamentos na tela de aprovações, causado principalmente por duplo clique acidental dos usuários no botão "Gerar Orçamento". O sistema utiliza múltiplas camadas de proteção.

## Camadas de Proteção

### 1. Sistema de Idempotência (Primeira Linha)
- **ID único por submissão**: Cada submissão recebe um ID único baseado nos dados + timestamp
- **Verificação imediata**: Antes de qualquer processamento, verifica se já foi processada
- **Recuperação de erro**: Em caso de falha, permite retry desmarcando a submissão
- **Limpeza automática**: Remove submissões antigas após 10 minutos

### 2. Debounce no Frontend (3 segundos)
- Previne duplo clique no botão de submissão
- Mostra toast informativo quando detectado
- Proteção imediata na interface do usuário

### 3. Sistema de Locks Globais
- Locks únicos baseados no submissionId (não mais no CNPJ)
- Previne submissões simultâneas do mesmo orçamento específico
- Permite múltiplos orçamentos da mesma empresa
- Auto-liberação após 30 segundos ou conclusão da operação

### 4. Verificação no Backend (submissionId)
- Consulta no banco de dados por orçamentos com mesmo submissionId
- Bloqueia apenas duplicatas exatas (mesmo ID de submissão)
- Permite múltiplos orçamentos da mesma empresa com IDs diferentes

### 5. Lock de Envio de E-mail
- Previne envio duplicado de e-mails
- Lock específico para cada operação de envio
- Timeout de 15 segundos

## Implementação Técnica

### Sistema de Idempotência (`submissionIdempotency`)

```typescript
// Gerar ID único
const submissionId = submissionIdempotency.generateSubmissionId(formData, productType);

// Verificar se já foi processada
if (submissionIdempotency.isAlreadyProcessed(submissionId)) {
  throw new Error('Submissão já processada');
}

// Marcar como processada
submissionIdempotency.markAsProcessed(submissionId);

try {
  // Processar submissão
} catch (error) {
  // Em caso de erro, permitir retry
  submissionIdempotency.unmarkAsProcessed(submissionId);
  throw error;
}
```

### Sistema de Locks (`submissionLock`)

```typescript
// Adquirir lock
const lockKey = `submit_${cnpj}_${productType}`;
if (!submissionLock.acquire(lockKey, 30000)) {
  throw new Error('Submissão já em andamento');
}

// Sempre liberar no finally
finally {
  submissionLock.release(lockKey);
}
```

### Tipos de Locks

1. **Submissão para Aprovação**: `submit_{submissionId}`
2. **Envio Direto**: `direct_{submissionId}`
3. **Envio de E-mail**: `email_{email}_{productType}_{timestamp}`

### Debounce no Frontend

```typescript
const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);

// Verificar duplo clique
const now = Date.now();
if (now - lastSubmissionTime < 3000) {
  // Bloquear submissão
  return;
}
```

## Estados do Sistema

### 1. Pronto para Enviar
- ✅ Nenhum lock ativo
- 🟢 Botão habilitado
- ⚡ Sistema pronto para receber submissões

### 2. Processando
- ⏳ Lock ativo
- 🔵 Botão com spinner
- 🔒 Submissões bloqueadas

### 3. Bloqueado por Duplo Clique
- ❌ Debounce ativo
- 🟠 Toast informativo
- ⏰ Aguardando 3 segundos

### 4. Erro/Timeout
- 🔓 Locks liberados automaticamente
- 🔄 Sistema pronto para retry

## Benefícios

### Para o Usuário
- Feedback imediato sobre duplo clique
- Prevenção de envios acidentais duplicados
- Possibilidade de enviar múltiplos orçamentos intencionalmente
- Mensagens claras sobre o estado do sistema

### Para o Sistema
- Eliminação de duplicatas na base de dados
- Redução de carga no servidor
- Prevenção de e-mails duplicados
- Melhor experiência na tela de aprovações

## Configuração

### Tempos de Proteção
```typescript
const DEBOUNCE_TIME = 3000;      // 3 segundos - duplo clique
const LOCK_TIMEOUT = 30000;      // 30 segundos - locks gerais
const EMAIL_LOCK_TIMEOUT = 15000; // 15 segundos - envio de e-mail
const DB_CHECK_WINDOW = 2 * 60 * 1000; // 2 minutos - verificação no banco
```

### Chaves de Lock
- Baseadas em identificadores únicos (CNPJ, email)
- Incluem tipo de produto para permitir submissões paralelas
- Timestamp para locks de e-mail

## Debug e Monitoramento

### Componente de Debug
```tsx
<SubmissionLockStatus className="mb-4" />
```

### Funções de Console

**Sistema de Idempotência:**
```javascript
// Teste básico
testIdempotency();

// Simular dupla submissão
simulateDoubleSubmission();

// Testar recuperação de erro
testErrorRecovery();

// Benchmark de performance
benchmarkIdempotency();
```

**Sistema de Locks:**
```javascript
// Status atual dos locks
checkCurrentLocks();

// Simular dupla submissão
simulateDoubleSubmission();

// Limpar todos os locks
clearAllLocks();

// Teste completo
testSubmissionLocks();
```

### Logs Importantes
- `🔒 Adquirindo lock para: {key}`
- `🔓 Liberando lock: {key}`
- `⏰ Lock auto-liberado por timeout: {key}`
- `Duplo clique detectado, ignorando submissão`
- `Já existe uma submissão em andamento`

## Testes

### Teste Manual
1. Preencher formulário
2. Clicar rapidamente várias vezes no botão
3. Verificar que apenas uma submissão é processada
4. Aguardar 3 segundos e testar nova submissão

### Teste de Locks
```javascript
// No console do navegador
testSubmissionLocks();
```

### Verificação de Duplicatas
1. Submeter orçamento
2. Verificar painel de aprovações
3. Confirmar que aparece apenas um card
4. Verificar e-mail (apenas um enviado)

## Arquivos Relacionados

- `src/utils/submissionIdempotency.ts` - Sistema de idempotência
- `src/utils/submissionLock.ts` - Sistema de locks
- `src/components/debug/SubmissionIdempotencyStatus.tsx` - Debug visual idempotência
- `src/components/debug/SubmissionLockStatus.tsx` - Debug visual locks
- `src/scripts/testIdempotency.ts` - Testes de idempotência
- `src/scripts/testSubmissionLocks.ts` - Testes de locks
- `src/services/approvalService.ts` - Implementação no backend
- `src/components/form/FormularioComplyEDocs2.tsx` - Proteção no formulário e-DOCS
- `src/components/form/FormularioComplyFiscal2.tsx` - Proteção no formulário Fiscal

## Monitoramento

### Métricas Recomendadas
- Número de locks ativos por período
- Taxa de submissões bloqueadas por duplo clique
- Duplicatas detectadas no backend (deve ser zero)
- Tempo médio de processamento de submissões

### Alertas
- Muitos locks ativos podem indicar problemas de performance
- Locks não liberados podem indicar falhas no sistema
- Duplicatas no banco indicam falha nas proteções