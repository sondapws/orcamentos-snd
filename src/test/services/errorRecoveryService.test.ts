import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorRecoveryService } from '@/services/errorRecoveryService';
import { EmailTemplateError } from '@/errors/EmailTemplateError';

describe('ErrorRecoveryService', () => {
  let errorRecoveryService: ErrorRecoveryService;

  beforeEach(() => {
    errorRecoveryService = new ErrorRecoveryService({
      maxRetries: 2,
      baseDelayMs: 100,
      enableAutoRecovery: true
    });
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('executeWithRecovery', () => {
    it('should return success on first attempt when operation succeeds', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success result');

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { operationName: 'test_operation' }
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe('success result');
      expect(result.attemptsUsed).toBe(1);
      expect(result.strategy).toBe('retry_with_backoff');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on temporary errors and succeed', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new EmailTemplateError('Timeout', 'DATABASE_TIMEOUT'))
        .mockResolvedValue('success after retry');

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { operationName: 'test_operation' }
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe('success after retry');
      expect(result.attemptsUsed).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries exceeded', async () => {
      const error = new EmailTemplateError('Persistent timeout', 'DATABASE_TIMEOUT');
      const mockOperation = vi.fn().mockRejectedValue(error);

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { operationName: 'test_operation' }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(EmailTemplateError);
      expect(result.error!.code).toBe('DATABASE_TIMEOUT');
      expect(result.attemptsUsed).toBe(3); // maxRetries + 1
      expect(result.strategy).toBe('manual_intervention_required');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-recoverable errors', async () => {
      const error = new EmailTemplateError('Template not found', 'TEMPLATE_NOT_FOUND');
      const mockOperation = vi.fn().mockRejectedValue(error);

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { operationName: 'test_operation' }
      );

      expect(result.success).toBe(false);
      expect(result.error!.code).toBe('TEMPLATE_NOT_FOUND');
      expect(result.attemptsUsed).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should handle non-EmailTemplateError exceptions', async () => {
      const genericError = new Error('Generic error');
      const mockOperation = vi.fn().mockRejectedValue(genericError);

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { operationName: 'test_operation' }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(EmailTemplateError);
      expect(result.error!.code).toBe('SYSTEM_ERROR');
      expect(result.attemptsUsed).toBe(1);
    });

    it('should respect auto recovery disabled setting', async () => {
      errorRecoveryService.updateConfig({ enableAutoRecovery: false });
      
      const error = new EmailTemplateError('Timeout', 'DATABASE_TIMEOUT');
      const mockOperation = vi.fn().mockRejectedValue(error);

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { operationName: 'test_operation' }
      );

      expect(result.success).toBe(false);
      expect(result.attemptsUsed).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should include operation context in results', async () => {
      const mockOperation = vi.fn().mockResolvedValue('test result');

      const result = await errorRecoveryService.executeWithRecovery(
        mockOperation,
        { 
          operationName: 'test_operation',
          params: { formulario: 'comply_fiscal', modalidade: 'on-premise' }
        }
      );

      expect(result.success).toBe(true);
      expect(result.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('backoff calculation', () => {
    it('should calculate exponential backoff correctly', () => {
      const service = new ErrorRecoveryService({
        baseDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 10000
      });

      // Usar reflexão para acessar método privado para teste
      const calculateBackoffDelay = (service as any).calculateBackoffDelay.bind(service);

      expect(calculateBackoffDelay(1)).toBe(1000);  // 1000 * 2^0
      expect(calculateBackoffDelay(2)).toBe(2000);  // 1000 * 2^1
      expect(calculateBackoffDelay(3)).toBe(4000);  // 1000 * 2^2
      expect(calculateBackoffDelay(4)).toBe(8000);  // 1000 * 2^3
      expect(calculateBackoffDelay(5)).toBe(10000); // Capped at maxDelayMs
    });
  });

  describe('error classification', () => {
    it('should correctly identify recoverable errors', () => {
      const service = new ErrorRecoveryService();
      const isRecoverableError = (service as any).isRecoverableError.bind(service);

      const recoverableError = new EmailTemplateError('Timeout', 'DATABASE_TIMEOUT');
      const nonRecoverableError = new EmailTemplateError('Not found', 'TEMPLATE_NOT_FOUND');

      expect(isRecoverableError(recoverableError)).toBe(true);
      expect(isRecoverableError(nonRecoverableError)).toBe(false);
    });

    it('should respect custom retryable error codes', () => {
      const service = new ErrorRecoveryService({
        retryableErrorCodes: ['CUSTOM_ERROR']
      });
      const isRecoverableError = (service as any).isRecoverableError.bind(service);

      const customError = new EmailTemplateError('Custom error', 'CUSTOM_ERROR' as any);
      expect(isRecoverableError(customError)).toBe(true);
    });
  });

  describe('recovery strategies', () => {
    it('should get applicable strategies for different error types', () => {
      const service = new ErrorRecoveryService();
      const getApplicableStrategies = (service as any).getApplicableStrategies.bind(service);

      const templateNotFoundError = new EmailTemplateError('Not found', 'TEMPLATE_NOT_FOUND');
      const dbConnectionError = new EmailTemplateError('Connection failed', 'DATABASE_CONNECTION_FAILED');
      const networkError = new EmailTemplateError('Network error', 'NETWORK_ERROR');

      const templateStrategies = getApplicableStrategies(templateNotFoundError);
      const dbStrategies = getApplicableStrategies(dbConnectionError);
      const networkStrategies = getApplicableStrategies(networkError);

      expect(templateStrategies).toContain('fallback_to_default');
      expect(dbStrategies).toContain('use_cached_result');
      expect(networkStrategies).toContain('use_cached_result');
    });
  });

  describe('configuration', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        maxRetries: 5,
        baseDelayMs: 2000,
        enableAutoRecovery: false
      };

      errorRecoveryService.updateConfig(newConfig);
      const config = errorRecoveryService.getConfig();

      expect(config.maxRetries).toBe(5);
      expect(config.baseDelayMs).toBe(2000);
      expect(config.enableAutoRecovery).toBe(false);
    });

    it('should maintain existing config when partially updating', () => {
      const originalConfig = errorRecoveryService.getConfig();
      
      errorRecoveryService.updateConfig({ maxRetries: 10 });
      const updatedConfig = errorRecoveryService.getConfig();

      expect(updatedConfig.maxRetries).toBe(10);
      expect(updatedConfig.baseDelayMs).toBe(originalConfig.baseDelayMs);
      expect(updatedConfig.enableAutoRecovery).toBe(originalConfig.enableAutoRecovery);
    });
  });

  describe('statistics', () => {
    it('should return recovery statistics', () => {
      const stats = errorRecoveryService.getRecoveryStatistics();

      expect(stats).toHaveProperty('activeRecoveries');
      expect(stats).toHaveProperty('totalRecoveries');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('averageAttempts');
      expect(stats).toHaveProperty('averageDuration');

      expect(typeof stats.activeRecoveries).toBe('number');
      expect(typeof stats.totalRecoveries).toBe('number');
      expect(typeof stats.successRate).toBe('number');
    });
  });

  describe('sleep utility', () => {
    it('should wait for specified duration', async () => {
      const service = new ErrorRecoveryService();
      const sleep = (service as any).sleep.bind(service);

      const startTime = Date.now();
      await sleep(100);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('operation ID generation', () => {
    it('should generate unique operation IDs', () => {
      const service = new ErrorRecoveryService();
      const generateOperationId = (service as any).generateOperationId.bind(service);

      const id1 = generateOperationId();
      const id2 = generateOperationId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^recovery_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^recovery_\d+_[a-z0-9]+$/);
    });
  });
});