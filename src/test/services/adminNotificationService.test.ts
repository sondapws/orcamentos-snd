import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminNotificationService, type NotificationChannel } from '@/services/adminNotificationService';
import { EmailTemplateError } from '@/errors/EmailTemplateError';

describe('AdminNotificationService', () => {
  let adminNotificationService: AdminNotificationService;

  beforeEach(() => {
    adminNotificationService = new AdminNotificationService({
      enabled: true,
      channels: ['console'],
      rateLimitMinutes: 1,
      severityThreshold: 'error'
    });

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  describe('notifyError', () => {
    it('should notify for errors requiring admin notification', async () => {
      const error = new EmailTemplateError('System failure', 'SYSTEM_ERROR');

      const results = await adminNotificationService.notifyError(
        error,
        { operation: 'template_search' }
      );

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].channel).toBe('console');

      const history = adminNotificationService.getNotificationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('system_failure');
      expect(history[0].severity).toBe('critical');
    });

    it('should not notify for errors below severity threshold', async () => {
      adminNotificationService.updateConfig({ severityThreshold: 'critical' });

      const error = new EmailTemplateError('Template not found', 'TEMPLATE_NOT_FOUND');

      const results = await adminNotificationService.notifyError(error);

      expect(results).toHaveLength(0);

      const history = adminNotificationService.getNotificationHistory();
      expect(history).toHaveLength(0);
    });

    it('should not notify when service is disabled', async () => {
      adminNotificationService.updateConfig({ enabled: false });

      const error = new EmailTemplateError('System failure', 'SYSTEM_ERROR');

      const results = await adminNotificationService.notifyError(error);

      expect(results).toHaveLength(0);
    });

    it('should include error context in notification', async () => {
      const error = new EmailTemplateError(
        'Database error',
        'DATABASE_ERROR',
        { query: 'SELECT *' },
        { formulario: 'comply_fiscal' }
      );

      await adminNotificationService.notifyError(
        error,
        { additionalInfo: 'test' }
      );

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.context).toEqual({
        formulario: 'comply_fiscal',
        additionalInfo: 'test'
      });
      expect(notification.error).toBeDefined();
      expect(notification.error!.code).toBe('DATABASE_ERROR');
    });
  });

  describe('notifySystemIssue', () => {
    it('should create and send system issue notification', async () => {
      const results = await adminNotificationService.notifySystemIssue(
        'configuration_issue',
        'Invalid configuration',
        'Template configuration is missing required fields',
        'warning',
        { configKey: 'defaultTemplate' }
      );

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.type).toBe('configuration_issue');
      expect(notification.title).toBe('Invalid configuration');
      expect(notification.severity).toBe('warning');
      expect(notification.context).toEqual({ configKey: 'defaultTemplate' });
    });
  });

  describe('notifyPerformanceIssue', () => {
    it('should create performance degradation notification', async () => {
      await adminNotificationService.notifyPerformanceIssue(
        'template_search',
        5000,
        1000,
        { queryComplexity: 'high' }
      );

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.type).toBe('performance_degradation');
      expect(notification.title).toBe('Performance degradada: template_search');
      expect(notification.message).toContain('5000ms');
      expect(notification.message).toContain('1000ms');
      expect(notification.severity).toBe('warning');
      expect(notification.context).toEqual({
        operation: 'template_search',
        duration: 5000,
        threshold: 1000,
        queryComplexity: 'high'
      });
    });
  });

  describe('notifyConfigurationIssue', () => {
    it('should create configuration issue notification', async () => {
      await adminNotificationService.notifyConfigurationIssue(
        'defaultTemplate.comply_fiscal',
        'Template não encontrado',
        'Verificar se o template existe e está ativo'
      );

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.type).toBe('configuration_issue');
      expect(notification.title).toBe('Problema de configuração: defaultTemplate.comply_fiscal');
      expect(notification.message).toContain('Template não encontrado');
      expect(notification.message).toContain('Verificar se o template existe');
      expect(notification.context).toEqual({
        configKey: 'defaultTemplate.comply_fiscal',
        issue: 'Template não encontrado',
        suggestion: 'Verificar se o template existe e está ativo'
      });
    });

    it('should create configuration issue notification without suggestion', async () => {
      await adminNotificationService.notifyConfigurationIssue(
        'webhookUrl',
        'URL inválida'
      );

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.message).toBe('URL inválida');
      expect(notification.context!.suggestion).toBeUndefined();
    });
  });

  describe('rate limiting', () => {
    it('should prevent duplicate notifications within rate limit window', async () => {
      const error = new EmailTemplateError('System error', 'SYSTEM_ERROR');

      // Primeira notificação
      const results1 = await adminNotificationService.notifyError(error);
      expect(results1).toHaveLength(1);

      // Segunda notificação imediata (deve ser bloqueada)
      const results2 = await adminNotificationService.notifyError(error);
      expect(results2).toHaveLength(0);

      const history = adminNotificationService.getNotificationHistory();
      expect(history).toHaveLength(1);
    });

    it('should allow notifications after rate limit window', async () => {
      // Configurar rate limit muito baixo para teste
      adminNotificationService.updateConfig({ rateLimitMinutes: 0.001 }); // ~60ms

      const error = new EmailTemplateError('System error', 'SYSTEM_ERROR');

      // Primeira notificação
      await adminNotificationService.notifyError(error);

      // Aguardar rate limit window
      await new Promise(resolve => setTimeout(resolve, 100));

      // Segunda notificação (deve passar)
      const results = await adminNotificationService.notifyError(error);
      expect(results).toHaveLength(1);

      const history = adminNotificationService.getNotificationHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('notification channels', () => {
    it('should send to console channel', async () => {
      const consoleSpy = vi.spyOn(console, 'error');

      const error = new EmailTemplateError('Critical error', 'SYSTEM_ERROR');
      await adminNotificationService.notifyError(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ADMIN ALERT - CRITICAL]')
      );
    });

    it('should handle multiple channels', async () => {
      adminNotificationService.updateConfig({
        channels: ['console', 'in_app']
      });

      const error = new EmailTemplateError('System error', 'SYSTEM_ERROR');
      const results = await adminNotificationService.notifyError(error);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.channel)).toEqual(['console', 'in_app']);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should handle channel errors gracefully', async () => {
      // Simular erro em canal específico
      adminNotificationService.updateConfig({
        channels: ['webhook'],
        webhookUrl: undefined // Vai causar erro
      });

      const error = new EmailTemplateError('System error', 'SYSTEM_ERROR');
      const results = await adminNotificationService.notifyError(error);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });

  describe('notification type mapping', () => {
    it('should map database errors to system_failure', async () => {
      const error = new EmailTemplateError('DB connection failed', 'DATABASE_CONNECTION_FAILED');
      await adminNotificationService.notifyError(error);

      const history = adminNotificationService.getNotificationHistory();
      expect(history[0].type).toBe('system_failure');
    });

    it('should map configuration errors to configuration_issue', async () => {
      const error = new EmailTemplateError('Invalid config', 'INVALID_CONFIGURATION');
      await adminNotificationService.notifyError(error);

      const history = adminNotificationService.getNotificationHistory();
      expect(history[0].type).toBe('configuration_issue');
    });

    it('should map fallback chain exhausted to critical_error', async () => {
      const error = new EmailTemplateError('No templates found', 'FALLBACK_CHAIN_EXHAUSTED');
      await adminNotificationService.notifyError(error);

      const history = adminNotificationService.getNotificationHistory();
      expect(history[0].type).toBe('critical_error');
    });
  });

  describe('message formatting', () => {
    it('should include context in error message when enabled', async () => {
      adminNotificationService.updateConfig({ includeContext: true });

      const error = new EmailTemplateError(
        'Test error',
        'SYSTEM_ERROR',
        undefined,
        { formulario: 'comply_fiscal', modalidade: 'on-premise' }
      );

      await adminNotificationService.notifyError(error);

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.message).toContain('Contexto:');
      expect(notification.message).toContain('formulario: comply_fiscal');
      expect(notification.message).toContain('modalidade: on-premise');
    });

    it('should include stack trace when enabled', async () => {
      adminNotificationService.updateConfig({ includeStackTrace: true });

      const error = new EmailTemplateError('Test error', 'SYSTEM_ERROR');
      await adminNotificationService.notifyError(error);

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.message).toContain('Stack trace:');
    });

    it('should exclude context and stack trace when disabled', async () => {
      adminNotificationService.updateConfig({
        includeContext: false,
        includeStackTrace: false
      });

      const error = new EmailTemplateError(
        'Test error',
        'SYSTEM_ERROR',
        undefined,
        { formulario: 'comply_fiscal' }
      );

      await adminNotificationService.notifyError(error);

      const history = adminNotificationService.getNotificationHistory();
      const notification = history[0];

      expect(notification.message).not.toContain('Contexto:');
      expect(notification.message).not.toContain('Stack trace:');
      expect(notification.message).toBe('Test error');
    });
  });

  describe('getNotificationHistory', () => {
    beforeEach(async () => {
      // Adicionar algumas notificações de teste
      await adminNotificationService.notifySystemIssue('critical_error', 'Error 1', 'Message 1');
      await adminNotificationService.notifySystemIssue('configuration_issue', 'Error 2', 'Message 2');
      await adminNotificationService.notifySystemIssue('system_failure', 'Error 3', 'Message 3');
    });

    it('should return all notifications when no limit specified', () => {
      const history = adminNotificationService.getNotificationHistory();
      expect(history).toHaveLength(3);
    });

    it('should limit results when limit specified', () => {
      const history = adminNotificationService.getNotificationHistory(2);
      expect(history).toHaveLength(2);
    });

    it('should return notifications in descending order by timestamp', () => {
      const history = adminNotificationService.getNotificationHistory();

      for (let i = 1; i < history.length; i++) {
        const currentTime = new Date(history[i].timestamp).getTime();
        const previousTime = new Date(history[i - 1].timestamp).getTime();
        expect(currentTime).toBeLessThanOrEqual(previousTime);
      }
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      // Adicionar notificações com diferentes tipos e severidades
      await adminNotificationService.notifySystemIssue('critical_error', 'Critical 1', 'Message', 'critical');
      await adminNotificationService.notifySystemIssue('critical_error', 'Critical 2', 'Message', 'critical');
      await adminNotificationService.notifySystemIssue('configuration_issue', 'Config 1', 'Message', 'warning');
      await adminNotificationService.notifySystemIssue('system_failure', 'System 1', 'Message', 'error');
    });

    it('should calculate correct statistics', () => {
      const stats = adminNotificationService.getStatistics();

      expect(stats.totalNotifications).toBe(4);
      expect(stats.notificationsByType['critical_error']).toBe(2);
      expect(stats.notificationsByType['configuration_issue']).toBe(1);
      expect(stats.notificationsByType['system_failure']).toBe(1);
      expect(stats.notificationsBySeverity['critical']).toBe(2);
      expect(stats.notificationsBySeverity['warning']).toBe(1);
      expect(stats.notificationsBySeverity['error']).toBe(1);
      expect(stats.recentNotifications).toBe(4); // Todas são recentes
    });
  });

  describe('configuration', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        enabled: false,
        channels: ['email', 'webhook'] as NotificationChannel[],
        emailRecipients: ['admin@example.com'],
        rateLimitMinutes: 10
      };

      adminNotificationService.updateConfig(newConfig);
      const config = adminNotificationService.getConfig();

      expect(config.enabled).toBe(false);
      expect(config.channels).toEqual(['email', 'webhook']);
      expect(config.emailRecipients).toEqual(['admin@example.com']);
      expect(config.rateLimitMinutes).toBe(10);
    });

    it('should maintain existing config when partially updating', () => {
      const originalConfig = adminNotificationService.getConfig();

      adminNotificationService.updateConfig({ rateLimitMinutes: 15 });
      const updatedConfig = adminNotificationService.getConfig();

      expect(updatedConfig.rateLimitMinutes).toBe(15);
      expect(updatedConfig.enabled).toBe(originalConfig.enabled);
      expect(updatedConfig.channels).toEqual(originalConfig.channels);
    });
  });
});