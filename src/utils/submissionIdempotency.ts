// Sistema de idempotência para submissões
// Garante que cada submissão seja processada apenas uma vez

class SubmissionIdempotency {
  private processedSubmissions = new Set<string>();
  private submissionTimestamps = new Map<string, number>();
  private readonly CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutos
  private readonly MAX_AGE = 5 * 60 * 1000; // 5 minutos

  constructor() {
    // Limpeza automática de submissões antigas
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Gera um ID único para uma submissão baseado nos dados do formulário
   */
  generateSubmissionId(formData: any, productType: string): string {
    const key = `${formData.cnpj}_${productType}_${formData.email}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
  }

  /**
   * Verifica se uma submissão já foi processada
   */
  isAlreadyProcessed(submissionId: string): boolean {
    return this.processedSubmissions.has(submissionId);
  }

  /**
   * Marca uma submissão como processada
   */
  markAsProcessed(submissionId: string): void {
    this.processedSubmissions.add(submissionId);
    this.submissionTimestamps.set(submissionId, Date.now());
    
    console.log(`🔒 Submissão marcada como processada: ${submissionId}`);
  }

  /**
   * Remove uma submissão da lista de processadas (em caso de erro)
   */
  unmarkAsProcessed(submissionId: string): void {
    this.processedSubmissions.delete(submissionId);
    this.submissionTimestamps.delete(submissionId);
    
    console.log(`🔓 Submissão desmarcada: ${submissionId}`);
  }

  /**
   * Limpa submissões antigas
   */
  private cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.submissionTimestamps.forEach((timestamp, submissionId) => {
      if (now - timestamp > this.MAX_AGE) {
        toRemove.push(submissionId);
      }
    });

    toRemove.forEach(submissionId => {
      this.processedSubmissions.delete(submissionId);
      this.submissionTimestamps.delete(submissionId);
    });

    if (toRemove.length > 0) {
      console.log(`🧹 Limpeza automática: ${toRemove.length} submissões antigas removidas`);
    }
  }

  /**
   * Obtém estatísticas do sistema
   */
  getStats(): { processed: number, oldest: string | null, newest: string | null } {
    const timestamps = Array.from(this.submissionTimestamps.values());
    
    return {
      processed: this.processedSubmissions.size,
      oldest: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null,
      newest: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null
    };
  }

  /**
   * Limpa todas as submissões (para debug)
   */
  clear(): void {
    const count = this.processedSubmissions.size;
    this.processedSubmissions.clear();
    this.submissionTimestamps.clear();
    console.log(`🧹 Todas as ${count} submissões foram limpas`);
  }

  /**
   * Lista todas as submissões processadas (para debug)
   */
  listProcessed(): string[] {
    return Array.from(this.processedSubmissions);
  }
}

// Instância global
export const submissionIdempotency = new SubmissionIdempotency();

// Disponibilizar para debug no console
if (typeof window !== 'undefined') {
  (window as any).submissionIdempotency = submissionIdempotency;
  
  console.log('🔧 Sistema de idempotência disponível:');
  console.log('- submissionIdempotency.getStats() - Ver estatísticas');
  console.log('- submissionIdempotency.listProcessed() - Listar processadas');
  console.log('- submissionIdempotency.clear() - Limpar todas');
}