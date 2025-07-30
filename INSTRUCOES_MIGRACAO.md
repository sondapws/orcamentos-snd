# 🚀 Instruções para Aplicar as Melhorias do Sistema de Aprovação

## 📋 Passo a Passo

### 1. Aplicar Migração no Supabase

**Opção A: Via Dashboard do Supabase (Recomendado)**
1. Acesse o dashboard do seu projeto Supabase
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `supabase/migrations/001_approval_system.sql`
4. Execute o SQL

**Opção B: Via CLI do Supabase**
```bash
supabase migration new approval_system
# Copie o conteúdo do arquivo 001_approval_system.sql para o novo arquivo
supabase db push
```

### 2. Verificar Instalação

Execute no console do navegador:
```javascript
import('./src/scripts/applyMigration.ts').then(m => m.applyMigration())
```

### 3. Testar o Sistema

1. **Acesse o painel administrativo**
2. **Clique no sino de notificações** - deve estar integrado
3. **Vá para "Painel de Aprovação"** - deve ter as abas "Pendentes" e "Histórico"
4. **Submeta um orçamento** - deve aparecer nas notificações

## 🔧 Estrutura das Tabelas Criadas

### `pending_quotes`
- Armazena orçamentos pendentes de aprovação
- Campos: id, form_data, product_type, status, etc.
- Índices otimizados para performance

### `approval_notifications`
- Armazena notificações do sistema
- Campos: id, type, message, quote_id, read, created_at
- Limpeza automática após 31 dias

### `approval_settings`
- Configurações do sistema de aprovação
- Campos: email_notifications, approver_email, auto_approval_domains

## 🎯 Funcionalidades Implementadas

### ✅ Notificações no Sino
- Integração completa com NotificationBell
- Ícones específicos para cada tipo
- Paginação com "Carregar mais"
- Formatação de tempo inteligente

### ✅ Armazenamento de 31 Dias
- Dados mantidos apenas por 31 dias
- Limpeza automática diária
- Função SQL `cleanup_old_notifications()`

### ✅ Paginação
- Notificações: 20 por página
- Histórico: 10 por página
- Carregamento incremental

### ✅ Prevenção de Duplicatas
- Verificação por CNPJ + produto
- Índice composto otimizado
- Retorna ID existente se duplicado

## 🐛 Solução de Problemas

### Erro: "Tabela não encontrada"
1. Verifique se executou a migração SQL
2. Confirme as permissões RLS no Supabase
3. Execute `applyMigration()` para verificar

### Erro: "RPC function not found"
- Normal! O sistema foi adaptado para não usar RPCs
- Use a migração SQL diretamente

### Notificações não aparecem
1. Verifique se as tabelas foram criadas
2. Confirme as políticas RLS
3. Teste com dados de exemplo

## 📊 Monitoramento

### Console Logs
- `applyMigration()` - verifica sistema
- `cleanupOldData()` - executa limpeza manual
- Logs automáticos de limpeza diária

### Dados de Teste
```javascript
// Verificar notificações
const { data } = await supabase.from('approval_notifications').select('*')

// Verificar orçamentos
const { data } = await supabase.from('pending_quotes').select('*')
```

## 🔄 Manutenção

### Limpeza Manual
```javascript
import('./src/scripts/applyMigration.ts').then(m => m.cleanupOldData())
```

### Verificar Status
```javascript
import('./src/scripts/applyMigration.ts').then(m => m.applyMigration())
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme a migração SQL foi aplicada
3. Teste as permissões RLS
4. Verifique a conexão com Supabase

---

**🎉 Após seguir estes passos, o sistema estará totalmente funcional com todas as melhorias implementadas!**