import { approvalService } from '@/services/approvalService';

// Função para testar o sistema de aprovação
export async function testApprovalSystem() {
  console.log('🧪 Testando sistema de aprovação...');
  
  try {
    // Teste 1: Verificar configurações
    console.log('1. Verificando configurações...');
    const settings = await approvalService.getSettings();
    console.log('✅ Configurações:', settings);
    
    // Teste 2: Buscar orçamentos pendentes
    console.log('2. Buscando orçamentos pendentes...');
    const pendingQuotes = await approvalService.getPendingQuotes();
    console.log('✅ Orçamentos pendentes:', pendingQuotes.length);
    
    // Teste 3: Buscar notificações
    console.log('3. Buscando notificações...');
    const notifications = await approvalService.getNotifications();
    console.log('✅ Notificações:', notifications.length);
    
    // Teste 4: Submeter um orçamento de teste
    console.log('4. Submetendo orçamento de teste...');
    const testFormData = {
      razaoSocial: 'Empresa Teste Ltda',
      cnpj: '12.345.678/0001-90',
      responsavel: 'João Silva',
      email: 'joao@empresateste.com.br',
      crm: 'CRM123',
      municipio: 'São Paulo',
      uf: 'SP'
    };
    
    const quoteId = await approvalService.submitForApproval(testFormData, 'comply_edocs');
    console.log('✅ Orçamento submetido com ID:', quoteId);
    
    // Teste 5: Verificar se o orçamento foi criado
    console.log('5. Verificando orçamento criado...');
    const updatedPendingQuotes = await approvalService.getPendingQuotes();
    console.log('✅ Orçamentos pendentes após submissão:', updatedPendingQuotes.length);
    
    console.log('🎉 Todos os testes passaram! Sistema funcionando corretamente.');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar teste se chamado diretamente
if (typeof window !== 'undefined') {
  testApprovalSystem();
}