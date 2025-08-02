// Sistema de lock para prevenir submissões duplicadas
class SubmissionLock {
  private locks = new Map<string, boolean>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  // Tentar adquirir um lock para uma chave específica
  acquire(key: string, timeoutMs: number = 30000): boolean {
    if (this.locks.get(key)) {
      console.log(`🔒 Lock já existe para: ${key}`);
      return false; // Lock já existe
    }

    console.log(`🔓 Adquirindo lock para: ${key}`);
    this.locks.set(key, true);

    // Auto-release após timeout
    const timeout = setTimeout(() => {
      this.release(key);
      console.log(`⏰ Lock auto-liberado por timeout: ${key}`);
    }, timeoutMs);

    this.timeouts.set(key, timeout);
    return true;
  }

  // Liberar um lock
  release(key: string): void {
    if (this.locks.has(key)) {
      console.log(`🔓 Liberando lock: ${key}`);
      this.locks.delete(key);
      
      const timeout = this.timeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.timeouts.delete(key);
      }
    }
  }

  // Verificar se um lock existe
  isLocked(key: string): boolean {
    return this.locks.get(key) || false;
  }

  // Limpar todos os locks (para debug)
  clear(): void {
    console.log('🧹 Limpando todos os locks');
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.locks.clear();
    this.timeouts.clear();
  }

  // Status para debug
  getStatus(): { locks: string[], count: number } {
    const locks = Array.from(this.locks.keys());
    return { locks, count: locks.length };
  }
}

// Instância global
export const submissionLock = new SubmissionLock();

// Disponibilizar para debug no console
if (typeof window !== 'undefined') {
  (window as any).submissionLock = submissionLock;
}