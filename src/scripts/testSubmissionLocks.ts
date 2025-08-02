// Script para testar o sistema de locks de submissão
import { submissionLock } from '@/utils/submissionLock';

export const testSubmissionLocks = () => {
  console.log('=== TESTE DO SISTEMA DE LOCKS ===');
  console.log('');
  
  // Status inicial
  console.log('1. Status inicial:', submissionLock.getStatus());
  
  // Teste de aquisição de lock
  console.log('2. Testando aquisição de locks...');
  const key1 = 'test_12345678000195_comply_edocs';
  const key2 = 'test_12345678000195_comply_fiscal';
  
  console.log('Tentando adquirir lock 1:', submissionLock.acquire(key1));
  console.log('Tentando adquirir lock 2:', submissionLock.acquire(key2));
  console.log('Tentando adquirir lock 1 novamente (deve falhar):', submissionLock.acquire(key1));
  
  console.log('Status após aquisições:', submissionLock.getStatus());
  
  // Teste de liberação
  console.log('3. Testando liberação...');
  submissionLock.release(key1);
  console.log('Status após liberar key1:', submissionLock.getStatus());
  
  // Teste de timeout automático
  console.log('4. Testando timeout automático (aguarde 2 segundos)...');
  const tempKey = 'temp_test_key';
  submissionLock.acquire(tempKey, 2000); // 2 segundos
  console.log('Lock temporário criado:', submissionLock.getStatus());
  
  setTimeout(() => {
    console.log('Status após timeout:', submissionLock.getStatus());
  }, 2500);
  
  // Limpeza
  setTimeout(() => {
    console.log('5. Limpando todos os locks...');
    submissionLock.clear();
    console.log('Status final:', submissionLock.getStatus());
  }, 3000);
};

export const simulateDoubleSubmission = () => {
  console.log('=== SIMULANDO DUPLA SUBMISSÃO ===');
  
  const cnpj = '12.345.678/0001-95';
  const productType = 'comply_edocs';
  const lockKey = `submit_${cnpj}_${productType}`;
  
  console.log('Simulando primeira submissão...');
  const firstLock = submissionLock.acquire(lockKey);
  console.log('Primeira submissão - Lock adquirido:', firstLock);
  
  console.log('Simulando segunda submissão (duplo clique)...');
  const secondLock = submissionLock.acquire(lockKey);
  console.log('Segunda submissão - Lock adquirido:', secondLock);
  
  if (!secondLock) {
    console.log('✅ Dupla submissão bloqueada com sucesso!');
  } else {
    console.log('❌ Falha: Dupla submissão não foi bloqueada!');
  }
  
  // Limpar
  submissionLock.release(lockKey);
  console.log('Lock liberado');
};

export const checkCurrentLocks = () => {
  console.log('=== STATUS ATUAL DOS LOCKS ===');
  const status = submissionLock.getStatus();
  console.log(`Total de locks ativos: ${status.count}`);
  
  if (status.locks.length > 0) {
    console.log('Locks ativos:');
    status.locks.forEach((lock, index) => {
      console.log(`${index + 1}. ${lock}`);
    });
  } else {
    console.log('Nenhum lock ativo');
  }
  
  return status;
};

export const clearAllLocks = () => {
  console.log('=== LIMPANDO TODOS OS LOCKS ===');
  const statusBefore = submissionLock.getStatus();
  console.log('Locks antes da limpeza:', statusBefore.count);
  
  submissionLock.clear();
  
  const statusAfter = submissionLock.getStatus();
  console.log('Locks após limpeza:', statusAfter.count);
  
  console.log('✅ Todos os locks foram limpos');
};

// Disponibilizar funções globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).testSubmissionLocks = testSubmissionLocks;
  (window as any).simulateDoubleSubmission = simulateDoubleSubmission;
  (window as any).checkCurrentLocks = checkCurrentLocks;
  (window as any).clearAllLocks = clearAllLocks;
  
  console.log('🔧 Funções de teste de locks disponíveis:');
  console.log('- testSubmissionLocks() - Teste completo do sistema');
  console.log('- simulateDoubleSubmission() - Simular dupla submissão');
  console.log('- checkCurrentLocks() - Ver locks ativos');
  console.log('- clearAllLocks() - Limpar todos os locks');
}