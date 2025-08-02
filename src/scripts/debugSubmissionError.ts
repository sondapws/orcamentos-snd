/**
 * Script para debugar erro de submissão de orçamentos
 * 
 * Este script ajuda a identificar a causa do erro "Ocorreu um erro ao processar seu orçamento"
 * quando tentamos inserir um novo orçamento para o mesmo CNPJ.
 */

import { approvalService } from '@/services/approvalService';
import { submissionIdempotency } from '@/utils/submissionIdempotency';
import { submissionLock } from '@/utils/submissionLock';

// Dados de teste para simular o problema
const testFormData = {
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'Empresa Teste LTDA',
  email: 'teste@empresa.com',
  responsavel: 'João Silva',
  segmento: 'Tecnologia',
  modalidade: 'saas',
  municipio: 'São Paulo',
  uf: 'SP',
  escopo: ['nfe', 'nfce'],
  quantidadeEmpresas: '1',
  quantidadeUfs: '1',
  volumetriaNotas: '1000',
  prazoContratacao: '12 meses'
};

async function debugSubmissionError() {
  console.log('🔍 Iniciando debug do erro de submissão...');
  
  try {
    // 1. Verificar estado atual do sistema de idempotência
    console.log('\n📊 Estado do sistema de idempotência:');
    const stats = submissionIdempotency.getStats();
    console.log('- Submissões processadas:', stats.processed);
    console.log('- Mais antiga:', stats.oldest);
    console.log('- Mais recente:', stats.newest);
    
    // 2. Listar submissões processadas
    const processed = submissionIdempotency.listProcessed();
    console.log('- IDs processados:', processed.slice(0, 5)); // Mostrar apenas os primeiros 5
    
    // 3. Gerar um novo submissionId para teste
    const submissionId = submissionIdempotency.generateSubmissionId(testFormData, 'comply_fiscal');
    console.log('\n🆔 Novo submissionId gerado:', submissionId);
    
    // 4. Verificar se já foi processado
    const alreadyProcessed = submissionIdempotency.isAlreadyProcessed(submissionId);
    console.log('- Já processado?', alreadyProcessed);
    
    // 5. Verificar orçamentos pendentes no banco
    console.log('\n📋 Verificando orçamentos pendentes no banco...');
    const pendingQuotes = await approvalService.getPendingQuotes();
    console.log('- Total de orçamentos pendentes:', pendingQuotes.length);
    
    // Filtrar por CNPJ de teste
    const sameCompanyQuotes = pendingQuotes.filter(q => 
      (q.form_data as any)?.cnpj === testFormData.cnpj
    );
    console.log('- Orçamentos pendentes para o mesmo CNPJ:', sameCompanyQuotes.length);
    
    if (sameCompanyQuotes.length > 0) {
      console.log('- Detalhes dos orçamentos existentes:');
      sameCompanyQuotes.forEach((quote, index) => {
        console.log(`  ${index + 1}. ID: ${quote.id}`);
        console.log(`     Status: ${quote.status}`);
        console.log(`     Submetido em: ${quote.submitted_at}`);
        console.log(`     SubmissionId: ${(quote.form_data as any)?.submissionId || 'N/A'}`);
      });
    }
    
    // 6. Tentar submeter um novo orçamento
    console.log('\n🚀 Tentando submeter novo orçamento...');
    
    const testData = {
      ...testFormData,
      submissionTimestamp: new Date().toISOString(),
      submissionId: submissionId
    };
    
    try {
      const quoteId = await approvalService.submitForApproval(testData, 'comply_fiscal');
      console.log('✅ Orçamento submetido com sucesso! ID:', quoteId);
    } catch (error) {
      console.error('❌ Erro ao submeter orçamento:', error);
      
      // Analisar o tipo de erro
      if (error instanceof Error) {
        console.log('- Tipo do erro:', error.constructor.name);
        console.log('- Mensagem:', error.message);
        console.log('- Stack trace:', error.stack?.split('\n').slice(0, 5).join('\n'));
      }
      
      // Verificar se é erro de idempotência
      if (error instanceof Error && error.message.includes('já foi processada')) {
        console.log('🔒 Erro de idempotência detectado');
      }
      
      // Verificar se é erro de lock
      if (error instanceof Error && error.message.includes('submissão em andamento')) {
        console.log('🔐 Erro de lock detectado');
      }
      
      // Verificar se é erro de banco de dados
      if (error && typeof error === 'object' && 'code' in error) {
        console.log('🗄️ Erro de banco de dados detectado');
        console.log('- Código:', (error as any).code);
        console.log('- Detalhes:', (error as any).details);
        console.log('- Hint:', (error as any).hint);
      }
    }
    
  } catch (error) {
    console.error('💥 Erro durante o debug:', error);
  }
}

async function clearSystemState() {
  console.log('🧹 Limpando estado do sistema...');
  
  // Limpar idempotência
  submissionIdempotency.clear();
  
  // Limpar locks (se houver método para isso)
  console.log('- Estado de idempotência limpo');
  console.log('- Sistema pronto para novos testes');
}

async function testMultipleSubmissions() {
  console.log('🔄 Testando múltiplas submissões...');
  
  const promises = [];
  
  for (let i = 0; i < 3; i++) {
    const testData = {
      ...testFormData,
      email: `teste${i}@empresa.com`, // Email diferente para cada teste
      submissionTimestamp: new Date().toISOString()
    };
    
    promises.push(
      approvalService.submitForApproval(testData, 'comply_fiscal')
        .then(id => ({ success: true, id, index: i }))
        .catch(error => ({ success: false, error: error.message, index: i }))
    );
  }
  
  const results = await Promise.all(promises);
  
  console.log('📊 Resultados das submissões simultâneas:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ Submissão ${result.index}: Sucesso (ID: ${result.id})`);
    } else {
      console.log(`❌ Submissão ${result.index}: Erro - ${result.error}`);
    }
  });
}

// Exportar funções para uso no console
if (typeof window !== 'undefined') {
  (window as any).debugSubmissionError = debugSubmissionError;
  (window as any).clearSystemState = clearSystemState;
  (window as any).testMultipleSubmissions = testMultipleSubmissions;
  
  console.log('🔧 Funções de debug disponíveis:');
  console.log('- debugSubmissionError() - Analisar erro de submissão');
  console.log('- clearSystemState() - Limpar estado do sistema');
  console.log('- testMultipleSubmissions() - Testar submissões simultâneas');
}

export { debugSubmissionError, clearSystemState, testMultipleSubmissions };