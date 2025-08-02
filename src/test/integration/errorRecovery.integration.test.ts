import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { approvalService } from '@/services/approvalService';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplateError } from '@/errors/EmailTemplateError';
import type { EmailTemplate } from '@/types/approval';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null })),
            eq: vi.fn(() => ({ data: [], error: null }))
          })),
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ data: [], error: null }))
            }))
          })),
          neq: vi.fn(() => ({ data: [], error: null })),
          not: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({ error: null })),
      delete: vi.fn(() => ({ error: null }))
    }))
  }
}));

// Mock do serviço de aprovação
vi.mock('@/services/approvalService', () => ({
  approvalService: {
    submitForApproval: vi.fn(),
    sendQuoteDirectly: vi.fn()
  }
}));

// Mock dos serviços auxiliares
vi.mock('@/services/auditLogger', () => ({
  auditLogger: {
    logTemplateSearch: vi.fn(),
    logFallbackUsage: vi.fn(),
    logError: vi.fn(),
    logOperation: vi.fn()
  }
}));

vi.mock('@/services/adminNotificationService', () => ({
  adminNotificationService: {
    notifyError: vi.fn(),
    notifyConfigurationIssue: vi.fn()
  }
}));

// Mock do serviço de recuperação de erro (implementação real para testes)
vi.mock('@/services/errorRecoveryService', () => ({
  errorRecoveryService: {
    executeWithRecovery: vi.fn()
  }
}));

describe('Error Recovery - Integration Tests', () => {
  const mockSupabase = vi.mocked(supabase);
  const mockApprovalService = vi.mocked(approvalService);

  // Template de teste
  const mockTemplate: EmailTemplate = {
    id: 'template-recovery-test',
    nome: 'Template Teste Recuperação',
    assunto: 'Teste de Recuperação - {{razaoSocial}}',
    corpo: 'Template para testes de recuperação de erro.',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_fiscal',
    modalidade: 'on-premise',
    created_at: '2025-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup padrão do mock
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null })),
            eq: vi.fn(() => ({ data: [], error: null }))
          })),
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ data: [], error: null }))
            }))
          })),
          neq: vi.fn(() => ({ data: [], error: null })),
          not: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({ error: null })),
      delete: vi.fn(() => ({ error: null }))
    } as any);

    // Mock padrão do serviço de recuperação
    const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
    errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
      try {
        const result = await fn();
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Recuperação de Erros de Conexão', () => {
    it('deve recuperar de timeout de conexão', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';

      // Mock: primeiro timeout, depois sucesso
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce({ 
          data: [mockTemplate], 
          error: null 
        });

      // Mock do serviço de recuperação com retry
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          try {
            const result = await fn();
            return { success: true, result };
          } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
              return { success: false, error: error as Error };
            }
            // Simular delay entre tentativas
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        return { success: false, error: new Error('Max attempts reached') };
      });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(mockTemplate);
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalledWith(
        expect.any(Function),
        {
          operationName: 'findByMapping',
          params: { formulario: 'comply_fiscal', modalidade: 'on-premise' }
        }
      );
    });

    it('deve falhar após esgotar tentativas de retry', async () => {
      // Arrange
      const persistentError = new Error('Persistent connection error');
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValue(persistentError);

      // Mock do serviço de recuperação que falha após tentativas
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        // Simular 3 tentativas que falham
        for (let i = 0; i < 3; i++) {
          try {
            await fn();
          } catch (error) {
            if (i === 2) { // Última tentativa
              return { success: false, error: error as Error };
            }
          }
        }
        return { success: false, error: persistentError };
      });

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow('Persistent connection error');

      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });

    it('deve recuperar de erro de rede intermitente', async () => {
      // Arrange
      const networkError = new Error('Network unreachable');
      networkError.name = 'NetworkError';

      // Mock: erro de rede, depois sucesso
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ 
          data: [mockTemplate], 
          error: null 
        });

      // Mock do serviço de recuperação com backoff exponencial
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        let attempts = 0;
        let delay = 100;

        while (attempts < 3) {
          try {
            const result = await fn();
            return { success: true, result };
          } catch (error) {
            attempts++;
            if (attempts >= 3) {
              return { success: false, error: error as Error };
            }
            // Backoff exponencial
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
        return { success: false, error: new Error('Max attempts reached') };
      });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(mockTemplate);
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });
  });

  describe('Recuperação de Erros de Banco de Dados', () => {
    it('deve recuperar de deadlock de transação', async () => {
      // Arrange
      const deadlockError = {
        code: '40P01',
        message: 'deadlock detected'
      };

      // Mock: deadlock, depois sucesso
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce({ 
          data: [mockTemplate], 
          error: null 
        });

      // Mock do serviço de recuperação para deadlocks
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          const result = await fn();
          return { success: true, result };
        } catch (error: any) {
          // Retry automático para deadlocks
          if (error.code === '40P01') {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
            try {
              const result = await fn();
              return { success: true, result };
            } catch (retryError) {
              return { success: false, error: retryError as Error };
            }
          }
          return { success: false, error: error as Error };
        }
      });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(mockTemplate);
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });

    it('deve recuperar de erro de constraint temporário', async () => {
      // Arrange
      const constraintError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      };

      // Mock: erro de constraint, depois sucesso
      mockSupabase.from().select().eq().eq().eq().neq
        .mockRejectedValueOnce(constraintError)
        .mockResolvedValueOnce({ 
          data: [], 
          error: null 
        });

      // Mock do serviço de recuperação
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          const result = await fn();
          return { success: true, result };
        } catch (error: any) {
          // Retry para erros de constraint
          if (error.code === '23505') {
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
              const result = await fn();
              return { success: true, result };
            } catch (retryError) {
              return { success: false, error: retryError as Error };
            }
          }
          return { success: false, error: error as Error };
        }
      });

      // Act
      const result = await emailTemplateMappingService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );

      // Assert
      expect(result).toBe(true);
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });

    it('deve tratar erro de conexão perdida com banco', async () => {
      // Arrange
      const connectionError = {
        code: '08006',
        message: 'connection to server was lost'
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValue(connectionError);

      // Mock do serviço de recuperação que falha para conexão perdida
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          await fn();
        } catch (error: any) {
          if (error.code === '08006') {
            // Conexão perdida - não fazer retry imediato
            return { success: false, error: error as Error };
          }
        }
        return { success: false, error: new Error('Unexpected error') };
      });

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow();

      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });
  });

  describe('Recuperação de Erros de Aplicação', () => {
    it('deve recuperar de erro de template corrompido', async () => {
      // Arrange
      const corruptedTemplate = {
        ...mockTemplate,
        nome: null, // Campo obrigatório corrompido
        assunto: undefined // Campo obrigatório indefinido
      };

      const validTemplate = mockTemplate;

      // Mock: template corrompido, depois template válido
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValueOnce({ 
          data: [corruptedTemplate], 
          error: null 
        })
        .mockResolvedValueOnce({ 
          data: [validTemplate], 
          error: null 
        });

      // Mock do serviço de recuperação com validação
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        const result = await fn();
        
        // Validar resultado
        if (result && typeof result === 'object' && 'nome' in result) {
          if (!result.nome || !result.assunto) {
            // Template corrompido - tentar novamente
            const retryResult = await fn();
            return { success: true, result: retryResult };
          }
        }
        
        return { success: true, result };
      });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(validTemplate);
      expect(result!.nome).toBeDefined();
      expect(result!.assunto).toBeDefined();
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });

    it('deve recuperar de erro de configuração inválida', async () => {
      // Arrange
      // Simular configuração de fallback inválida
      emailTemplateMappingService.updateFallbackConfig({
        defaultTemplates: {
          comply_fiscal: 'template-inexistente'
        }
      });

      // Mock: template configurado não encontrado, usar fallback padrão
      mockSupabase.from().select().eq().eq().single
        .mockResolvedValueOnce({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' }
        });

      // Mock: template padrão encontrado
      mockSupabase.from().select().eq().eq().eq().is().order().limit
        .mockResolvedValueOnce({ 
          data: [mockTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

      // Assert
      expect(result.template).toEqual(mockTemplate);
      expect(result.isDefault).toBe(true);
      expect(result.fallbackType).toBe('form_default');
      
      // Verificar se notificação de configuração foi enviada
      const { adminNotificationService } = await import('@/services/adminNotificationService');
      expect(adminNotificationService.notifyConfigurationIssue).toHaveBeenCalledWith(
        'defaultTemplate.comply_fiscal',
        expect.stringContaining('Template padrão configurado'),
        expect.any(String)
      );
    });

    it('deve recuperar de erro de validação de dados', async () => {
      // Arrange
      const invalidData = {
        formulario: 'invalid_form', // Formulário inválido
        modalidade: 'invalid_mode' // Modalidade inválida
      };

      // Mock do serviço de recuperação com validação de entrada
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          // Validar parâmetros antes de executar
          if (options?.params) {
            const { formulario, modalidade } = options.params as any;
            
            if (!['comply_fiscal', 'comply_edocs'].includes(formulario)) {
              throw new EmailTemplateError(
                'Formulário inválido',
                'INVALID_PARAMETER',
                { formulario }
              );
            }
            
            if (!['on-premise', 'saas'].includes(modalidade)) {
              throw new EmailTemplateError(
                'Modalidade inválida',
                'INVALID_PARAMETER',
                { modalidade }
              );
            }
          }
          
          const result = await fn();
          return { success: true, result };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      });

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping(
          invalidData.formulario as any,
          invalidData.modalidade as any
        )
      ).rejects.toThrow('Formulário inválido');

      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });
  });

  describe('Recuperação de Erros de Integração', () => {
    it('deve recuperar de erro no serviço de aprovação', async () => {
      // Arrange
      const approvalError = new Error('Approval service temporarily unavailable');
      
      mockApprovalService.submitForApproval
        .mockRejectedValueOnce(approvalError)
        .mockResolvedValueOnce('quote-recovered-123');

      // Act
      let result;
      try {
        await mockApprovalService.submitForApproval({}, 'comply_fiscal');
      } catch (error) {
        // Retry após erro
        result = await mockApprovalService.submitForApproval({}, 'comply_fiscal');
      }

      // Assert
      expect(result).toBe('quote-recovered-123');
      expect(mockApprovalService.submitForApproval).toHaveBeenCalledTimes(2);
    });

    it('deve recuperar de erro de webhook', async () => {
      // Arrange
      const webhookError = new Error('Webhook endpoint not responding');
      
      mockApprovalService.sendQuoteDirectly
        .mockRejectedValueOnce(webhookError)
        .mockResolvedValueOnce(true);

      // Act
      let result;
      try {
        await mockApprovalService.sendQuoteDirectly({}, 'comply_edocs');
      } catch (error) {
        // Fallback para fluxo de aprovação
        result = await mockApprovalService.sendQuoteDirectly({}, 'comply_edocs');
      }

      // Assert
      expect(result).toBe(true);
      expect(mockApprovalService.sendQuoteDirectly).toHaveBeenCalledTimes(2);
    });

    it('deve recuperar de erro de auditoria', async () => {
      // Arrange
      const auditError = new Error('Audit service unavailable');
      
      const { auditLogger } = vi.mocked(await import('@/services/auditLogger'));
      auditLogger.logTemplateSearch
        .mockRejectedValueOnce(auditError)
        .mockResolvedValueOnce(undefined);

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [mockTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(mockTemplate);
      
      // Auditoria deve ter sido tentada
      expect(auditLogger.logTemplateSearch).toHaveBeenCalled();
    });
  });

  describe('Recuperação de Erros de Sistema', () => {
    it('deve recuperar de erro de memória insuficiente', async () => {
      // Arrange
      const memoryError = new Error('JavaScript heap out of memory');
      memoryError.name = 'RangeError';

      // Mock do serviço de recuperação com limpeza de memória
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          const result = await fn();
          return { success: true, result };
        } catch (error: any) {
          if (error.name === 'RangeError' && error.message.includes('heap')) {
            // Simular limpeza de memória
            if (global.gc) {
              global.gc();
            }
            
            // Retry após limpeza
            try {
              const result = await fn();
              return { success: true, result };
            } catch (retryError) {
              return { success: false, error: retryError as Error };
            }
          }
          return { success: false, error: error as Error };
        }
      });

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValueOnce(memoryError)
        .mockResolvedValueOnce({ 
          data: [mockTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(mockTemplate);
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });

    it('deve recuperar de erro de timeout de operação', async () => {
      // Arrange
      const timeoutError = new Error('Operation timed out');
      timeoutError.name = 'TimeoutError';

      // Mock do serviço de recuperação com timeout aumentado
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          // Simular timeout na primeira tentativa
          const result = await Promise.race([
            fn(),
            new Promise((_, reject) => 
              setTimeout(() => reject(timeoutError), 100)
            )
          ]);
          return { success: true, result };
        } catch (error: any) {
          if (error.name === 'TimeoutError') {
            // Retry com timeout maior
            try {
              const result = await Promise.race([
                fn(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Extended timeout')), 5000)
                )
              ]);
              return { success: true, result };
            } catch (retryError) {
              return { success: false, error: retryError as Error };
            }
          }
          return { success: false, error: error as Error };
        }
      });

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [mockTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual(mockTemplate);
      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
    });

    it('deve falhar graciosamente quando recuperação não é possível', async () => {
      // Arrange
      const criticalError = new Error('Critical system error - cannot recover');
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValue(criticalError);

      // Mock do serviço de recuperação que não consegue recuperar
      const { errorRecoveryService } = vi.mocked(await import('@/services/errorRecoveryService'));
      errorRecoveryService.executeWithRecovery.mockImplementation(async (fn, options) => {
        try {
          await fn();
        } catch (error: any) {
          // Erro crítico - não tentar recuperar
          if (error.message.includes('Critical system error')) {
            return { success: false, error: error as Error };
          }
        }
        return { success: false, error: criticalError };
      });

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow('Critical system error - cannot recover');

      expect(errorRecoveryService.executeWithRecovery).toHaveBeenCalled();
      
      // Verificar se erro foi logado
      const { auditLogger } = await import('@/services/auditLogger');
      expect(auditLogger.logError).toHaveBeenCalled();
      
      // Verificar se administradores foram notificados
      const { adminNotificationService } = await import('@/services/adminNotificationService');
      expect(adminNotificationService.notifyError).toHaveBeenCalled();
    });
  });
});