# 🔧 Correção: Modal de Rejeição

## 🐛 **Problema Identificado**

### **Comportamento Anterior:**
- Ao digitar o motivo e clicar "Confirmar Rejeição", o modal fechava e abria repetidamente
- Modal ficava "piscando" - fechando e abrindo várias vezes
- Experiência confusa e frustrante para o usuário
- Comportamento inconsistente na interface

### **Causa Raiz:**
- Conflito entre controle manual do estado `rejectModalOpen` e o `onOpenChange` do Dialog
- Múltiplas funções tentando controlar o estado do modal simultaneamente
- Limpeza de estado acontecendo em momentos conflitantes

## ✅ **Solução Implementada**

### **Antes (Problemático):**
```typescript
// Múltiplos pontos controlando o modal
const handleRejectConfirm = async () => {
  // ... lógica de rejeição
  if (success) {
    setRejectModalOpen(false);     // ❌ Controle direto
    setSelectedQuoteId('');        // ❌ Limpeza manual
    setRejectionReason('');        // ❌ Estados separados
  }
};

// Dialog com controle automático conflitante
<Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
  {/* ❌ setRejectModalOpen conflita com controle manual */}
```

### **Depois (Corrigido):**
```typescript
// Função centralizada para fechar modal
const handleCloseModal = () => {
  setRejectModalOpen(false);
  setSelectedQuoteId('');
  setRejectionReason('');
};

const handleRejectConfirm = async () => {
  // ... lógica de rejeição
  if (success) {
    handleCloseModal(); // ✅ Controle centralizado
  }
};

// Dialog com controle personalizado
<Dialog open={rejectModalOpen} onOpenChange={(open) => {
  if (!open) {
    handleCloseModal(); // ✅ Só fecha, não abre
  }
}}>
```

## 🔄 **Fluxo Corrigido**

### **Cenário: Rejeição de Orçamento**
1. **Usuário clica "Rejeitar"** → `handleRejectClick()`
   - ✅ `setSelectedQuoteId(quoteId)`
   - ✅ `setRejectionReason('')`
   - ✅ `setRejectModalOpen(true)`

2. **Usuário digita motivo** → `onChange` do Textarea
   - ✅ `setRejectionReason(value)`

3. **Usuário clica "Confirmar"** → `handleRejectConfirm()`
   - ✅ Valida motivo obrigatório
   - ✅ Processa rejeição
   - ✅ Mostra toast de sucesso
   - ✅ Chama `handleCloseModal()` - **CENTRALIZADO**

4. **Modal fecha limpo** → `handleCloseModal()`
   - ✅ `setRejectModalOpen(false)`
   - ✅ `setSelectedQuoteId('')`
   - ✅ `setRejectionReason('')`

### **Cenário: Cancelar Rejeição**
1. **Usuário clica "Cancelar"** → `handleCloseModal()`
   - ✅ Mesma função centralizada
   - ✅ Estados limpos consistentemente

2. **Usuário clica fora do modal** → `onOpenChange(false)`
   - ✅ Chama `handleCloseModal()`
   - ✅ Comportamento consistente

## 🎯 **Benefícios da Correção**

### **Controle Centralizado:**
```typescript
// ✅ Uma única função para fechar modal
const handleCloseModal = () => {
  setRejectModalOpen(false);
  setSelectedQuoteId('');
  setRejectionReason('');
};

// ✅ Usada em todos os pontos de fechamento
- handleRejectConfirm() // Após sucesso
- Botão Cancelar        // Cancelamento manual
- onOpenChange()        // Clique fora/ESC
```

### **Prevenção de Conflitos:**
```typescript
// ✅ onOpenChange só responde ao fechamento
onOpenChange={(open) => {
  if (!open) {           // Só executa quando fechando
    handleCloseModal();  // Função centralizada
  }
}}
```

### **Estados Consistentes:**
- ✅ **Modal sempre fecha** completamente
- ✅ **Estados sempre limpos** juntos
- ✅ **Sem "piscadas"** ou comportamento estranho
- ✅ **Experiência fluida** para o usuário

## 🧪 **Como Testar**

### **Cenário de Teste:**
1. **Clique "Rejeitar"** em um orçamento
2. **Digite um motivo** no campo de texto
3. **Clique "Confirmar Rejeição"**
4. **Observe o comportamento** do modal

### **Resultado Esperado:**
- ✅ Modal abre normalmente
- ✅ Permite digitar motivo
- ✅ Processa rejeição ao confirmar
- ✅ **Modal fecha uma única vez** - sem "piscar"
- ✅ Toast de sucesso aparece
- ✅ Histórico atualiza automaticamente

### **Testes Adicionais:**
- **Cancelar:** Modal fecha limpo
- **Clique fora:** Modal fecha limpo
- **ESC:** Modal fecha limpo
- **Motivo vazio:** Validação funciona, modal permanece aberto

## 🔧 **Detalhes Técnicos**

### **Função Centralizada:**
```typescript
const handleCloseModal = () => {
  setRejectModalOpen(false);    // Fecha modal
  setSelectedQuoteId('');       // Limpa ID selecionado
  setRejectionReason('');       // Limpa motivo digitado
};
```

### **Controle do Dialog:**
```typescript
<Dialog 
  open={rejectModalOpen} 
  onOpenChange={(open) => {
    if (!open) {              // Só responde ao fechamento
      handleCloseModal();     // Usa função centralizada
    }
    // Não responde à abertura (open === true)
  }}
>
```

### **Pontos de Uso:**
1. **Sucesso na rejeição** → `handleCloseModal()`
2. **Botão Cancelar** → `handleCloseModal()`
3. **Clique fora/ESC** → `onOpenChange(false)` → `handleCloseModal()`

## 📱 **Interface Melhorada**

### **Comportamento Atual:**
```
┌─────────────────────────────────────┐
│ Rejeitar Orçamento                  │
├─────────────────────────────────────┤
│ Motivo da rejeição *                │
│ ┌─────────────────────────────────┐ │
│ │ [Usuário digita motivo...]      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│              [Cancelar] [Confirmar] │
└─────────────────────────────────────┘
```

### **Fluxo Corrigido:**
1. Modal abre → Usuário digita → Clica Confirmar
2. **Modal fecha UMA vez** → Toast aparece
3. Histórico atualiza → Experiência fluida

---

**🎉 Modal de rejeição corrigido! Comportamento estável e consistente implementado.**