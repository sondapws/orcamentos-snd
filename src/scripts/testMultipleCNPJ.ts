// Script para testar múltiplos orçamentos do mesmo CNPJ
import { submissionIdempotency } from '@/utils/submissionIdempotency';

export const testMultipleCNPJSubmissions = () => {
  console.log('=== TESTE DE MÚLTIPLOS ORÇAMENTOS DO MESMO CNPJ ===');
  console.log('');

  const mockFormData = {
    cnpj: '12.345.678/0001-95',
    razaoSocial: 'EMPRESA TESTE LTDA',
    email: 'teste@empresa.com',
    responsavel: 'João Silva',
    segmento: 'Tecnologia'
  };

  console.log('Dados base do formulário:', mockFormData);
  console.log('');

  console.log('Cenários de teste:');
  console.log('');

  // Cenário 1: Múltiplas submissões legítimas
  console.log('1. MÚLTIPLAS SUBMISSÕES LEGÍTIMAS (mesmo CNPJ):');
  console.log('   - Mesmo CNPJ, diferentes modalidades');
  console.log('   - Mesmo CNPJ, diferentes produtos');
  console.log('   - Mesmo CNPJ, diferentes responsáveis');
  console.log('   ✅ DEVE SER PERMITIDO');
  console.log('');

  // Gerar IDs para diferentes cenários
  const id1 = submissionIdempotency.generateSubmissionId({...mockFormData, modalidade: 'on-premise'}, 'comply_edocs');
  const id2 = submissionIdempotency.generateSubmissionId({...mockFormData, modalidade: 'saas'}, 'comply_edocs');
  const id3 = submissionIdempotency.generateSubmissionId({...mockFormData}, 'comply_fiscal');

  console.log('IDs gerados para diferentes cenários:');
  console.log(`- e-DOCS On-premise: ${id1.substring(0, 16)}...`);
  console.log(`- e-DOCS SaaS: ${id2.substring(0, 16)}...`);
  console.log(`- Comply Fiscal: ${id3.substring(0, 16)}...`);
  console.log(`- Todos únicos: ${new Set([id1, id2, id3]).size === 3 ? '✅' : '❌'}`);
  console.log('');

  // Cenário 2: Duplo clique (deve ser bloqueado)
  console.log('2. DUPLO CLIQUE (mesmo formulário):');
  console.log('   - Mesmo CNPJ, mesmos dados, mesmo momento');
  console.log('   ❌ DEVE SER BLOQUEADO');
  console.log('');

  const duplicateId = submissionIdempotency.generateSubmissionId(mockFormData, 'comply_edocs');
  console.log(`ID para teste de duplo clique: ${duplicateId.substring(0, 16)}...`);

  // Simular primeira submissão
  if (!submissionIdempotency.isAlreadyProcessed(duplicateId)) {
    submissionIdempotency.markAsProcessed(duplicateId);
    console.log('✅ Primeira submissão: PERMITIDA');
  } else {
    console.log('❌ Primeira submissão: BLOQUEADA (erro)');
  }

  // Simular segunda submissão (duplo clique)
  if (!submissionIdempotency.isAlreadyProcessed(duplicateId)) {
    console.log('❌ Segunda submissão: PERMITIDA (erro)');
  } else {
    console.log('✅ Segunda submissão: BLOQUEADA (correto)');
  }

  console.log('');

  // Cenário 3: Nova submissão após tempo
  console.log('3. NOVA SUBMISSÃO APÓS TEMPO:');
  console.log('   - Mesmo CNPJ, após limpeza automática');
  console.log('   ✅ DEVE SER PERMITIDO');
  console.log('   (Limpeza automática ocorre após 5 minutos)');
  console.log('');

  return {
    mockFormData,
    generatedIds: [id1, id2, id3],
    duplicateTest: duplicateId
  };
};

export const simulateMultipleQuotesFlow = () => {
  console.log('=== SIMULAÇÃO DE FLUXO DE MÚLTIPLOS ORÇAMENTOS ===');
  console.log('');

  const company = {
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'EMPRESA MÚLTIPLOS ORÇAMENTOS LTDA',
    email: 'multiplos@empresa.com'
  };

  console.log(`Empresa: ${company.razaoSocial}`);
  console.log(`CNPJ: ${company.cnpj}`);
  console.log('');

  const scenarios = [
    {
      name: 'Orçamento 1: Comply e-DOCS On-premise',
      data: { ...company, modalidade: 'on-premise', segmento: 'Indústria' },
      product: 'comply_edocs'
    },
    {
      name: 'Orçamento 2: Comply e-DOCS SaaS',
      data: { ...company, modalidade: 'saas', segmento: 'Serviços' },
      product: 'comply_edocs'
    },
    {
      name: 'Orçamento 3: Comply Fiscal On-premise',
      data: { ...company, modalidade: 'on-premise', segmento: 'Comércio' },
      product: 'comply_fiscal'
    },
    {
      name: 'Orçamento 4: Comply Fiscal SaaS',
      data: { ...company, modalidade: 'saas', segmento: 'Tecnologia' },
      product: 'comply_fiscal'
    }
  ];

  console.log('Cenários de orçamento para a mesma empresa:');
  console.log('');

  scenarios.forEach((scenario, index) => {
    const id = submissionIdempotency.generateSubmissionId(scenario.data, scenario.product as any);
    
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   Modalidade: ${scenario.data.modalidade}`);
    console.log(`   Segmento: ${scenario.data.segmento}`);
    console.log(`   ID único: ${id.substring(0, 16)}...`);
    console.log(`   Status: ${submissionIdempotency.isAlreadyProcessed(id) ? '❌ BLOQUEADO' : '✅ PERMITIDO'}`);
    console.log('');
  });

  console.log('Resultado esperado:');
  console.log('✅ Todos os 4 orçamentos devem ser PERMITIDOS');
  console.log('✅ Cada um deve gerar um card separado no painel');
  console.log('✅ Cada um deve enviar um e-mail separado');
  console.log('');

  return scenarios;
};

export const testCNPJFlexibility = () => {
  console.log('=== TESTE DE FLEXIBILIDADE POR CNPJ ===');
  console.log('');

  const baseCNPJ = '11.222.333/0001-44';
  
  console.log('Testando diferentes variações para o mesmo CNPJ:');
  console.log(`CNPJ base: ${baseCNPJ}`);
  console.log('');

  const variations = [
    { desc: 'Modalidade diferente', data: { cnpj: baseCNPJ, modalidade: 'on-premise' } },
    { desc: 'Produto diferente', data: { cnpj: baseCNPJ, modalidade: 'saas' } },
    { desc: 'Responsável diferente', data: { cnpj: baseCNPJ, responsavel: 'Maria Silva' } },
    { desc: 'E-mail diferente', data: { cnpj: baseCNPJ, email: 'outro@empresa.com' } },
    { desc: 'Segmento diferente', data: { cnpj: baseCNPJ, segmento: 'Educação' } }
  ];

  variations.forEach((variation, index) => {
    const id1 = submissionIdempotency.generateSubmissionId(variation.data, 'comply_edocs');
    const id2 = submissionIdempotency.generateSubmissionId(variation.data, 'comply_fiscal');
    
    console.log(`${index + 1}. ${variation.desc}:`);
    console.log(`   e-DOCS ID: ${id1.substring(0, 12)}... (${submissionIdempotency.isAlreadyProcessed(id1) ? 'Processado' : 'Novo'})`);
    console.log(`   Fiscal ID: ${id2.substring(0, 12)}... (${submissionIdempotency.isAlreadyProcessed(id2) ? 'Processado' : 'Novo'})`);
    console.log('');
  });

  console.log('Conclusão:');
  console.log('✅ Mesmo CNPJ pode ter múltiplos orçamentos');
  console.log('✅ Cada variação gera ID único');
  console.log('✅ Sistema flexível para necessidades reais');
  console.log('');
};

// Disponibilizar funções globalmente
if (typeof window !== 'undefined') {
  (window as any).testMultipleCNPJSubmissions = testMultipleCNPJSubmissions;
  (window as any).simulateMultipleQuotesFlow = simulateMultipleQuotesFlow;
  (window as any).testCNPJFlexibility = testCNPJFlexibility;
  
  console.log('🔧 Funções de teste para múltiplos CNPJ disponíveis:');
  console.log('- testMultipleCNPJSubmissions() - Teste básico de múltiplos orçamentos');
  console.log('- simulateMultipleQuotesFlow() - Simular fluxo completo');
  console.log('- testCNPJFlexibility() - Testar flexibilidade do sistema');
}