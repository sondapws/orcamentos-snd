import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogger } from '@/services/auditLogger';
import { EmailTemplateError } from '@/errors/EmailTemplateError';

// Mock the admin notification service to prevent it from logging
vi.mock('@/services/adminNotificationService', () => ({
  adminNotificationService: {
    notifyError: vi.fn(),
    notifySystemIssue: vi.fn(),
    notifyPerformanceIssue: vi.fn(),
    notifyConfigurationIssue: vi.fn()
  }
}));

describe('AuditLogger', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    auditLogger = new AuditLogger({
      enabled: true,
      enableConsoleOutput: false, // Desabilitar para testes
      maxLogEntries: 10
    });
    
    // Clear any existing logs
    (auditLogger as any).logs = [];
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('logOperation', () => {
    it('should log operation successfully', async () => {
      await auditLogger.logOperation(
        'template_search',
        'template',
        { formulario: 'comply_fiscal', modalidade: 'on-premise' },
        'success',
        'template-123',
        'user-456',
        150
      );

      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.operation).toBe('template_search');
      expect(log.entityType).toBe('template');
      expect(log.result).toBe('success');
      expect(log.entityId).toBe('template-123');
      expect(log.userId).toBe('user-456');
      expect(log.duration).toBe(150);
      expect(log.details).toEqual({ formulario: 'comply_fiscal', modalidade: 'on-premise' });
    });

    it('should not log when disabled', async () => {
      auditLogger.updateConfig({ enabled: false });

      await auditLogger.logOperation(
        'template_search',
        'template',
        { test: 'data' }
      );

      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('should include error information when provided', async () => {
      const error = new EmailTemplateError('Test error', 'TEMPLATE_NOT_FOUND');

      await auditLogger.logOperation(
        'template_search',
        'template',
        { formulario: 'comply_fiscal' },
        'failure',
        undefined,
        undefined,
        undefined,
        error
      );

      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      const log = logs[0];
      
      expect(log.error).toBeDefined();
      expect(log.error!.code).toBe('TEMPLATE_NOT_FOUND');
      expect(log.error!.message).toBe('Test error');
    });
  });

  describe('logTemplateSearch', () => {
    it('should log successful template search', async () => {
      await auditLogger.logTemplateSearch(
        'comply_fiscal',
        'on-premise',
        true,
        'template-123',
        false,
        undefined,
        200
      );

      const logs = auditLogger.getLogs();
      const log = logs[0];
      
      expect(log.operation).toBe('template_search');
      expect(log.result).toBe('success');
      expect(log.details.templateFound).toBe(true);
      expect(log.details.templateId).toBe('template-123');
      expect(log.details.fallbackUsed).toBe(false);
      expect(log.duration).toBe(200);
    });

    it('should log failed template search as warning', async () => {
      await auditLogger.logTemplateSearch(
        'comply_edocs',
        'saas',
        false,
        undefined,
        true,
        'configured_default',
        300
      );

      const logs = auditLogger.getLogs();
      const log = logs[0];
      
      expect(log.result).toBe('warning');
      expect(log.details.templateFound).toBe(false);
      expect(log.details.fallbackUsed).toBe(true);
      expect(log.details.fallbackType).toBe('configured_default');
    });
  });

  describe('logFallbackUsage', () => {
    it('should log fallback usage with warning result', async () => {
      await auditLogger.logFallbackUsage(
        'comply_fiscal',
        'on-premise',
        'form_default',
        'template-456',
        'Template Padrão',
        'Nenhum template específico encontrado'
      );

      const logs = auditLogger.getLogs();
      const log = logs[0];
      
      expect(log.operation).toBe('template_fallback_used');
      expect(log.result).toBe('warning');
      expect(log.details.fallbackType).toBe('form_default');
      expect(log.details.templateName).toBe('Template Padrão');
      expect(log.details.reason).toBe('Nenhum template específico encontrado');
    });
  });

  describe('logError', () => {
    it('should log error with failure result', async () => {
      const error = new EmailTemplateError(
        'Database connection failed',
        'DATABASE_CONNECTION_FAILED',
        { connectionString: 'postgres://...' },
        { operation: 'findTemplate' }
      );

      await auditLogger.logError('template_search', error, { retryAttempt: 1 });

      const logs = auditLogger.getLogs();
      const log = logs[0];
      
      expect(log.operation).toBe('template_search');
      expect(log.result).toBe('failure');
      expect(log.details.errorCode).toBe('DATABASE_CONNECTION_FAILED');
      expect(log.details.errorMessage).toBe('Database connection failed');
      expect(log.details.operation).toBe('findTemplate');
      expect(log.details.retryAttempt).toBe(1);
      expect(log.error).toBeDefined();
    });
  });

  describe('logErrorRecovery', () => {
    it('should log successful error recovery', async () => {
      const originalError = new EmailTemplateError('Test error', 'DATABASE_TIMEOUT');

      await auditLogger.logErrorRecovery(
        originalError,
        2,
        'retry_with_backoff',
        true,
        { totalDuration: 5000 }
      );

      const logs = auditLogger.getLogs();
      const log = logs[0];
      
      expect(log.operation).toBe('error_recovery_success');
      expect(log.result).toBe('success');
      expect(log.details.originalErrorCode).toBe('DATABASE_TIMEOUT');
      expect(log.details.recoveryAttempt).toBe(2);
      expect(log.details.recoveryStrategy).toBe('retry_with_backoff');
      expect(log.details.totalDuration).toBe(5000);
    });

    it('should log failed error recovery', async () => {
      const originalError = new EmailTemplateError('Test error', 'SYSTEM_ERROR');

      await auditLogger.logErrorRecovery(
        originalError,
        3,
        'fallback_to_default',
        false,
        { reason: 'No fallback template available' }
      );

      const logs = auditLogger.getLogs();
      const log = logs[0];
      
      expect(log.operation).toBe('error_recovery_failed');
      expect(log.result).toBe('failure');
      expect(log.details.originalErrorCode).toBe('SYSTEM_ERROR');
      expect(log.details.recoveryAttempt).toBe(3);
      expect(log.details.recoveryStrategy).toBe('fallback_to_default');
      expect(log.details.reason).toBe('No fallback template available');
    });
  });

  describe('getLogs', () => {
    beforeEach(async () => {
      // Clear logs first
      (auditLogger as any).logs = [];
      
      // Adicionar alguns logs de teste
      await auditLogger.logOperation('template_search', 'template', { test: 1 }, 'success');
      await auditLogger.logOperation('mapping_validation', 'mapping', { test: 2 }, 'failure');
      await auditLogger.logOperation('template_search', 'template', { test: 3 }, 'warning');
    });

    it('should return all logs when no filter provided', () => {
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(3);
    });

    it('should filter by operation', () => {
      const logs = auditLogger.getLogs({ operation: 'template_search' });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.operation === 'template_search')).toBe(true);
    });

    it('should filter by result', () => {
      const logs = auditLogger.getLogs({ result: 'failure' });
      expect(logs).toHaveLength(1);
      expect(logs[0].result).toBe('failure');
    });

    it('should filter by entity type', () => {
      const logs = auditLogger.getLogs({ entityType: 'template' });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.entityType === 'template')).toBe(true);
    });

    it('should apply limit', () => {
      const logs = auditLogger.getLogs({ limit: 2 });
      expect(logs).toHaveLength(2);
    });

    it('should filter by date range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const logs = auditLogger.getLogs({ 
        startDate: oneHourAgo,
        endDate: now
      });
      
      expect(logs).toHaveLength(3); // Todos os logs devem estar no range
    });

    it('should return logs in descending order by timestamp', () => {
      const logs = auditLogger.getLogs();
      
      for (let i = 1; i < logs.length; i++) {
        const currentTime = new Date(logs[i].timestamp).getTime();
        const previousTime = new Date(logs[i - 1].timestamp).getTime();
        expect(currentTime).toBeLessThanOrEqual(previousTime);
      }
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      // Clear logs first
      (auditLogger as any).logs = [];
      
      // Adicionar logs com diferentes resultados e operações
      await auditLogger.logOperation('template_search', 'template', {}, 'success', undefined, undefined, 100);
      await auditLogger.logOperation('template_search', 'template', {}, 'success', undefined, undefined, 200);
      await auditLogger.logOperation('mapping_validation', 'mapping', {}, 'failure');
      await auditLogger.logOperation('template_search', 'template', {}, 'warning', undefined, undefined, 150);
      
      // Adicionar erro para estatísticas
      const error = new EmailTemplateError('Test', 'DATABASE_ERROR');
      await auditLogger.logError('template_search', error);
    });

    it('should calculate correct statistics', () => {
      const stats = auditLogger.getStatistics();
      
      expect(stats.totalOperations).toBe(5);
      expect(stats.successRate).toBe(40); // 2 success out of 5
      expect(stats.errorRate).toBe(40); // 2 failure out of 5
      expect(stats.warningRate).toBe(20); // 1 warning out of 5
      
      expect(stats.operationCounts['template_search']).toBe(4);
      expect(stats.operationCounts['mapping_validation']).toBe(1);
      
      expect(stats.errorCounts['DATABASE_ERROR']).toBe(1);
      
      expect(stats.averageResponseTime).toBe(150); // (100 + 200 + 150) / 3
    });

    it('should filter statistics by timeframe', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const stats = auditLogger.getStatistics({
        startDate: oneHourAgo,
        endDate: now
      });
      
      expect(stats.totalOperations).toBe(5); // Todos os logs estão no timeframe
    });
  });

  describe('configuration', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        maxLogEntries: 50,
        retentionDays: 7,
        enableConsoleOutput: true
      };

      auditLogger.updateConfig(newConfig);
      const config = auditLogger.getConfig();
      
      expect(config.maxLogEntries).toBe(50);
      expect(config.retentionDays).toBe(7);
      expect(config.enableConsoleOutput).toBe(true);
    });

    it('should maintain existing config when partially updating', () => {
      const originalConfig = auditLogger.getConfig();
      
      auditLogger.updateConfig({ maxLogEntries: 25 });
      const updatedConfig = auditLogger.getConfig();
      
      expect(updatedConfig.maxLogEntries).toBe(25);
      expect(updatedConfig.enabled).toBe(originalConfig.enabled);
      expect(updatedConfig.retentionDays).toBe(originalConfig.retentionDays);
    });
  });

  describe('log cleanup', () => {
    it('should limit number of logs based on maxLogEntries', async () => {
      auditLogger.updateConfig({ maxLogEntries: 3 });
      
      // Adicionar mais logs que o limite
      for (let i = 0; i < 5; i++) {
        await auditLogger.logOperation('template_search', 'template', { index: i });
      }
      
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(3);
    });
  });
});