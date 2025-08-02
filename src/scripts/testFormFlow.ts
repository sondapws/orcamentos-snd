// Script para testar o fluxo completo do formulário
export const testFormFlow = () => {
  console.log('=== TESTE DO FLUXO COMPLETO DO FORMULÁRIO ===');
  console.log('');
  
  console.log('Como testar o fluxo completo:');
  console.log('');
  
  console.log('1. PREENCHER FORMULÁRIO:');
  console.log('   - Acesse o formulário (Comply e-DOCS ou Comply Fiscal)');
  console.log('   - Preencha todos os campos obrigatórios no Step 1');
  console.log('   - Clique em "Avançar" para ir ao Step 2');
  console.log('   - Preencha todos os campos obrigatórios no Step 2');
  console.log('   - Clique em "Gerar Orçamento"');
  console.log('');
  
  console.log('2. VERIFICAR PROCESSAMENTO:');
  console.log('   ✅ Deve mostrar "Processando..." no botão');
  console.log('   ✅ Deve aparecer toast "Orçamento Enviado"');
  console.log('   ✅ Deve aguardar 2 segundos');
  console.log('   ✅ Deve limpar o formulário automaticamente');
  console.log('   ✅ Deve voltar para o Step 1');
  console.log('');
  
  console.log('3. VERIFICAR NO PAINEL DE APROVAÇÕES:');
  console.log('   ✅ Deve aparecer APENAS UM card de aprovação');
  console.log('   ✅ Não deve haver duplicatas');
  console.log('');
  
  console.log('4. VERIFICAR E-MAIL:');
  console.log('   ✅ Deve receber APENAS UM e-mail');
  console.log('   ✅ Assunto deve ser "Orçamento Comply - NOME_EMPRESA"');
  console.log('   ✅ Não deve ter duplicação no assunto');
  console.log('');
  
  console.log('5. TESTE DE DUPLO CLIQUE:');
  console.log('   - Preencha o formulário novamente');
  console.log('   - Clique rapidamente várias vezes no botão "Gerar Orçamento"');
  console.log('   ✅ Deve processar apenas uma vez');
  console.log('   ✅ Pode aparecer toast "Aguarde alguns segundos"');
  console.log('   ✅ Deve aparecer apenas um card no painel');
  console.log('');
  
  console.log('6. LOGS IMPORTANTES PARA OBSERVAR:');
  console.log('   - "🔒 Submissão marcada como processada: [ID]"');
  console.log('   - "Orçamento inserido com sucesso: [ID]"');
  console.log('   - "Formulário completo e orçamento enviado"');
  console.log('   - "Limpando formulário e voltando ao início..."');
  console.log('');
  
  console.log('7. PROBLEMAS QUE NÃO DEVEM MAIS OCORRER:');
  console.log('   ❌ Dois cards de aprovação');
  console.log('   ❌ E-mails duplicados');
  console.log('   ❌ Assunto "Seu orçamento - Seu Orçamento"');
  console.log('   ❌ Formulário não limpar após envio');
  console.log('   ❌ Não voltar para Step 1');
  console.log('');
  
  console.log('8. FERRAMENTAS DE DEBUG:');
  console.log('   - submissionIdempotency.getStats() - Ver submissões processadas');
  console.log('   - submissionLock.getStatus() - Ver locks ativos');
  console.log('   - debugEmailTemplates() - Verificar templates');
  console.log('');
};

export const checkFormState = () => {
  console.log('=== VERIFICAÇÃO DO ESTADO DO FORMULÁRIO ===');
  
  // Verificar se há elementos do formulário na página
  const step1Elements = document.querySelectorAll('[data-step="1"]');
  const step2Elements = document.querySelectorAll('[data-step="2"]');
  const submitButtons = document.querySelectorAll('button[type="submit"]');
  const formInputs = document.querySelectorAll('input, select, textarea');
  
  console.log('Elementos encontrados na página:');
  console.log(`- Elementos Step 1: ${step1Elements.length}`);
  console.log(`- Elementos Step 2: ${step2Elements.length}`);
  console.log(`- Botões de submit: ${submitButtons.length}`);
  console.log(`- Campos de formulário: ${formInputs.length}`);
  
  // Verificar se há campos preenchidos
  let filledFields = 0;
  formInputs.forEach(input => {
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
      if (input.value && input.value.trim() !== '') {
        filledFields++;
      }
    }
  });
  
  console.log(`- Campos preenchidos: ${filledFields}`);
  
  // Verificar estado dos botões
  submitButtons.forEach((button, index) => {
    if (button instanceof HTMLButtonElement) {
      console.log(`- Botão ${index + 1}: ${button.disabled ? 'DESABILITADO' : 'HABILITADO'} - "${button.textContent?.trim()}"`);
    }
  });
  
  // Verificar indicador de step
  const stepIndicators = document.querySelectorAll('[class*="step"], [class*="Step"]');
  console.log(`- Indicadores de step: ${stepIndicators.length}`);
  
  return {
    step1Elements: step1Elements.length,
    step2Elements: step2Elements.length,
    submitButtons: submitButtons.length,
    formInputs: formInputs.length,
    filledFields,
    hasActiveSubmit: Array.from(submitButtons).some(btn => !btn.disabled)
  };
};

export const simulateFormCompletion = () => {
  console.log('=== SIMULAÇÃO DE CONCLUSÃO DO FORMULÁRIO ===');
  
  // Simular dados de um formulário preenchido
  const mockFormData = {
    // Step 1
    razaoSocial: 'EMPRESA TESTE SIMULAÇÃO LTDA',
    cnpj: '12.345.678/0001-95',
    municipio: 'São Paulo',
    uf: 'SP',
    responsavel: 'João da Silva',
    email: 'joao@empresateste.com',
    
    // Step 2
    segmento: 'Tecnologia',
    modalidade: 'saas',
    volumetriaNotas: 'ate-20000',
    prazoContratacao: 24,
    
    // Controle
    step: 2,
    completed: false
  };
  
  console.log('Dados simulados do formulário:');
  console.log(JSON.stringify(mockFormData, null, 2));
  
  console.log('\nFluxo esperado após submissão:');
  console.log('1. Gerar ID de idempotência');
  console.log('2. Verificar se já foi processado');
  console.log('3. Marcar como processado');
  console.log('4. Adquirir lock');
  console.log('5. Verificar duplicatas no banco');
  console.log('6. Inserir no banco');
  console.log('7. Criar notificação');
  console.log('8. Enviar e-mail (se configurado)');
  console.log('9. Liberar lock');
  console.log('10. Mostrar toast de sucesso');
  console.log('11. Aguardar 2 segundos');
  console.log('12. Limpar formulário');
  console.log('13. Voltar para Step 1');
  
  return mockFormData;
};

// Disponibilizar funções globalmente
if (typeof window !== 'undefined') {
  (window as any).testFormFlow = testFormFlow;
  (window as any).checkFormState = checkFormState;
  (window as any).simulateFormCompletion = simulateFormCompletion;
  
  console.log('🔧 Funções de teste do fluxo do formulário disponíveis:');
  console.log('- testFormFlow() - Instruções de teste completo');
  console.log('- checkFormState() - Verificar estado atual do formulário');
  console.log('- simulateFormCompletion() - Simular conclusão do formulário');
}