// Script para testar o sistema de idempotência
import { submissionIdempotency } from '@/utils/submissionIdempotency';

export const testIdempotency = () => {
  console.log('=== TESTE DO SISTEMA DE IDEMPOTÊNCIA ===');
  console.log('');

  // Dados de teste
  const mockFormData = {
    cnpj: '12.345.678/0001-95',
    razaoSocial: 'EMPRESA TESTE LTDA',
    email: 'teste@empresa.com',
    responsavel: 'João Silva'
  };

  const productType = 'comply_edocs';

  console.log('1. Gerando IDs únicos...');
  const id1 = submissionIdempotency.generateSubmissionId(mockFormData, productType);
  const id2 = submissionIdempotency.generateSubmissionId(mockFormData, productType);
  
  console.log(`ID 1: ${id1}`);
  console.log(`ID 2: ${id2}`);
  console.log(`IDs são diferentes: ${id1 !== id2 ? '✅' : '❌'}`);

  console.log('\n2. Testando processamento...');
  console.log(`Já processado (antes): ${submissionIdempotency.isAlreadyProcessed(id1) ? '❌' : '✅'}`);
  
  submissionIdempotency.markAsProcessed(id1);
  console.log(`Já processado (depois): ${submissionIdempotency.isAlreadyProcessed(id1) ? '✅' : '❌'}`);

  console.log('\n3. Testando dupla submissão...');
  console.log(`Tentativa 1: ${submissionIdempotency.isAlreadyProcessed(id1) ? 'BLOQUEADA ✅' : 'PERMITIDA ❌'}`);
  console.log(`Tentativa 2: ${submissionIdempotency.isAlreadyProcessed(id1) ? 'BLOQUEADA ✅' : 'PERMITIDA ❌'}`);

  console.log('\n4. Testando desmarcação (erro)...');
  submissionIdempotency.unmarkAsProcessed(id1);
  console.log(`Após desmarcação: ${submissionIdempotency.isAlreadyProcessed(id1) ? '❌' : '✅ PERMITIDA'}`);

  console.log('\n5. Estatísticas:');
  console.log(submissionIdempotency.getStats());

  console.log('\n6. Lista de processadas:');
  console.log(submissionIdempotency.listProcessed());
};

export const simulateDoubleSubmission = () => {
  console.log('=== SIMULAÇÃO DE DUPLA SUBMISSÃO ===');
  
  const mockFormData = {
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'TESTE DUPLICAÇÃO LTDA',
    email: 'duplicacao@teste.com'
  };

  console.log('Dados do formulário:', mockFormData);

  // Simular primeira submissão
  console.log('\n🖱️  Primeira submissão...');
  const id1 = submissionIdempotency.generateSubmissionId(mockFormData, 'comply_fiscal');
  console.log(`ID gerado: ${id1}`);
  
  if (!submissionIdempotency.isAlreadyProcessed(id1)) {
    submissionIdempotency.markAsProcessed(id1);
    console.log('✅ Primeira submissão processada com sucesso');
  } else {
    console.log('❌ Primeira submissão foi bloqueada (não deveria acontecer)');
  }

  // Simular segunda submissão (duplo clique)
  console.log('\n🖱️  Segunda submissão (duplo clique)...');
  if (!submissionIdempotency.isAlreadyProcessed(id1)) {
    console.log('❌ Segunda submissão foi permitida (PROBLEMA!)');
  } else {
    console.log('✅ Segunda submissão foi bloqueada corretamente');
  }

  // Simular nova submissão legítima (ID diferente)
  console.log('\n🖱️  Nova submissão legítima...');
  const id2 = submissionIdempotency.generateSubmissionId(mockFormData, 'comply_fiscal');
  console.log(`Novo ID: ${id2}`);
  
  if (!submissionIdempotency.isAlreadyProcessed(id2)) {
    console.log('✅ Nova submissão permitida (correto)');
  } else {
    console.log('❌ Nova submissão foi bloqueada (não deveria)');
  }
};

export const testErrorRecovery = () => {
  console.log('=== TESTE DE RECUPERAÇÃO DE ERRO ===');
  
  const mockFormData = {
    cnpj: '11.222.333/0001-44',
    razaoSocial: 'TESTE ERRO LTDA',
    email: 'erro@teste.com'
  };

  const id = submissionIdempotency.generateSubmissionId(mockFormData, 'comply_edocs');
  console.log(`ID de teste: ${id}`);

  // Marcar como processada
  console.log('\n1. Marcando como processada...');
  submissionIdempotency.markAsProcessed(id);
  console.log(`Status: ${submissionIdempotency.isAlreadyProcessed(id) ? 'PROCESSADA' : 'LIVRE'}`);

  // Simular erro e desmarcação
  console.log('\n2. Simulando erro e desmarcação...');
  submissionIdempotency.unmarkAsProcessed(id);
  console.log(`Status após erro: ${submissionIdempotency.isAlreadyProcessed(id) ? 'PROCESSADA' : 'LIVRE PARA RETRY'}`);

  // Tentar novamente
  console.log('\n3. Tentando novamente após erro...');
  if (!submissionIdempotency.isAlreadyProcessed(id)) {
    submissionIdempotency.markAsProcessed(id);
    console.log('✅ Retry bem-sucedido');
  } else {
    console.log('❌ Retry bloqueado');
  }
};

export const benchmarkIdempotency = () => {
  console.log('=== BENCHMARK DO SISTEMA ===');
  
  const iterations = 1000;
  const mockFormData = {
    cnpj: '00.000.000/0001-00',
    razaoSocial: 'BENCHMARK LTDA',
    email: 'benchmark@teste.com'
  };

  console.log(`Gerando ${iterations} IDs únicos...`);
  const startTime = Date.now();
  
  const ids = [];
  for (let i = 0; i < iterations; i++) {
    const id = submissionIdempotency.generateSubmissionId(mockFormData, 'comply_edocs');
    ids.push(id);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ ${iterations} IDs gerados em ${duration}ms`);
  console.log(`📊 Média: ${(duration / iterations).toFixed(2)}ms por ID`);
  
  // Verificar unicidade
  const uniqueIds = new Set(ids);
  console.log(`🔍 IDs únicos: ${uniqueIds.size}/${iterations} (${((uniqueIds.size / iterations) * 100).toFixed(2)}%)`);
  
  if (uniqueIds.size === iterations) {
    console.log('✅ Todos os IDs são únicos');
  } else {
    console.log('❌ Há IDs duplicados!');
  }
};

// Disponibilizar funções globalmente
if (typeof window !== 'undefined') {
  (window as any).testIdempotency = testIdempotency;
  (window as any).simulateDoubleSubmission = simulateDoubleSubmission;
  (window as any).testErrorRecovery = testErrorRecovery;
  (window as any).benchmarkIdempotency = benchmarkIdempotency;
  
  console.log('🔧 Funções de teste de idempotência disponíveis:');
  console.log('- testIdempotency() - Teste básico do sistema');
  console.log('- simulateDoubleSubmission() - Simular dupla submissão');
  console.log('- testErrorRecovery() - Testar recuperação de erro');
  console.log('- benchmarkIdempotency() - Benchmark de performance');
}