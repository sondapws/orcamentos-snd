# Correção de Duplicação no Assunto dos E-mails

## Problema Identificado

Os e-mails de orçamento estavam sendo enviados com assuntos duplicados, como:
- "Seu orçamento - Seu Orçamento - SONDA PROCWORK"
- "Seu Orçamento - Seu Orçamento Comply - EMPRESA TESTE"

## Causa Raiz

O problema ocorria devido a uma combinação de fatores:

1. **Template no Banco**: O template padrão tinha assunto "Seu Orçamento - {{razaoSocial}}"
2. **Código de Fallback**: Quando nenhum template era encontrado, o código usava "Seu orçamento Comply - ${formData.razaoSocial}"
3. **Sistema de Mapeamento**: O sistema de fallback estava encontrando o template padrão e processando as variáveis corretamente, mas o template já continha "Seu Orçamento"

## Soluções Implementadas

### 1. Correção na Migração do Banco
```sql
-- Antes
'Seu Orçamento - {{razaoSocial}}'

-- Depois  
'Orçamento Comply - {{razaoSocial}}'
```

### 2. Correção no Código de Fallback
```typescript
// Antes
let emailSubject = `Seu orçamento Comply - ${formData.razaoSocial}`;

// Depois
emailSubject = `Orçamento Comply - ${formData.razaoSocial}`;
```

### 3. Correção nos Formulários de Template
Atualizados os formulários para usar "Orçamento Comply" como padrão em vez de "Seu Orçamento".

### 4. Script de Correção para Templates Existentes
Criado script SQL para corrigir templates já existentes no banco de dados.

## Arquivos Modificados

- `supabase/migrations/20250618120639-fda2fe5c-7c31-4907-963b-1533b9b635ed.sql`
- `src/services/approvalService.ts`
- `src/components/admin/email/FormularioNovoTemplate.tsx`
- `src/components/admin/email/FormularioTemplateEmail.tsx`

## Scripts de Correção Criados

- `fix_duplicate_subjects.sql` - Script SQL para corrigir templates existentes
- `src/scripts/fixDuplicateSubjects.ts` - Script TypeScript para correção via interface
- `src/scripts/debugEmailTemplates.ts` - Script para debug e análise de templates

## Como Aplicar as Correções

### 1. Para Novos Deployments
As correções na migração garantem que novos deployments não terão o problema.

### 2. Para Bancos Existentes
Execute o script SQL no painel do Supabase:
```sql
-- Ver fix_duplicate_subjects.sql
```

### 3. Via Interface (Desenvolvimento)
```javascript
// No console do navegador
debugEmailTemplates();     // Analisar templates
previewSubjectFixes();     // Ver preview das correções
fixDuplicateSubjects();    // Aplicar correções
```

## Verificação da Correção

### 1. Verificar Templates no Banco
```sql
SELECT nome, assunto 
FROM public.email_templates 
WHERE ativo = true;
```

### 2. Testar Envio de E-mail
1. Submeter um orçamento de teste
2. Verificar o assunto do e-mail recebido
3. Confirmar que não há duplicação

### 3. Verificar Logs
```javascript
// No console
debugEmailTemplates();
```

## Padrões de Assunto Corretos

### Templates Específicos
- `Orçamento Comply e-DOCS - {{razaoSocial}}`
- `Orçamento Comply Fiscal - {{razaoSocial}}`
- `Proposta {{razaoSocial}} - Comply`

### Template Padrão do Sistema
- `Orçamento Comply - {{razaoSocial}}`

### Fallback do Código
- `Orçamento Comply - ${formData.razaoSocial}`

## Prevenção de Regressão

### 1. Validação nos Formulários
Os formulários de criação/edição de templates agora usam "Orçamento Comply" como padrão.

### 2. Testes Automatizados
Adicionados testes para verificar que não há duplicação nos assuntos.

### 3. Scripts de Monitoramento
Scripts disponíveis para verificar periodicamente se há duplicações.

## Monitoramento Contínuo

### Verificação Periódica
```javascript
// Executar mensalmente
checkTemplateSubjects();
```

### Alertas
- Monitorar logs de e-mail para assuntos duplicados
- Verificar feedback de usuários sobre e-mails estranhos

## Impacto da Correção

### Antes
- ❌ "Seu orçamento - Seu Orçamento - EMPRESA"
- ❌ Confusão para os usuários
- ❌ Aparência não profissional

### Depois  
- ✅ "Orçamento Comply - EMPRESA TESTE LTDA"
- ✅ Assunto claro e profissional
- ✅ Consistência em todos os e-mails

## Notas Técnicas

### Sistema de Fallback
O sistema de fallback continua funcionando normalmente:
1. Busca template específico (formulário + modalidade)
2. Busca template padrão configurado
3. Busca template padrão do formulário
4. Usa template global de fallback
5. Usa template padrão do código

### Substituição de Variáveis
A substituição de variáveis `{{razaoSocial}}` continua funcionando normalmente, mas agora sem duplicação no assunto.

### Compatibilidade
As correções são compatíveis com versões anteriores e não quebram funcionalidades existentes.