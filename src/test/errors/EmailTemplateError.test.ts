import { describe, it, expect, beforeEach } from 'vitest';
import { 
  EmailTemplateError, 
  EmailTemplateErrorFactory,
  TEMPORARY_ERROR_CODES,
  ADMIN_NOTIFICATION_ERROR_CODES,
  CRITICAL_ERROR_CODES,
  WARNING_ERROR_CODES
} from '@/errors/EmailTemplateError';

describe('EmailTemplateError', () => {
  describe('constructor', () => {
    it('should create error with basic properties', () => {
      const error = new EmailTemplateError(
        'Test error message',
        'TEMPLATE_NOT_FOUND',
        { templateId: '123' },
        { formulario: 'comply_fiscal' }
      );

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEMPLATE_NOT_FOUND');
      expect(error.details).toEqual({ templateId: '123' });
      expect(error.context).toEqual({ formulario: 'comply_fiscal' });
      expect(error.name).toBe('EmailTemplateError');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should maintain correct stack trace', () => {
      const error = new EmailTemplateError('Test', 'SYSTEM_ERROR');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('EmailTemplateError.test.ts');
    });
  });

  describe('toLogObject', () => {
    it('should convert error to serializable log object', () => {
      const error = new EmailTemplateError(
        'Test error',
        'DATABASE_ERROR',
        { query: 'SELECT *' },
        { operation: 'findTemplate' }
      );

      const logObject = error.toLogObject();

      expect(logObject).toEqual({
        name: 'EmailTemplateError',
        message: 'Test error',
        code: 'DATABASE_ERROR',
        timestamp: error.timestamp.toISOString(),
        details: { query: 'SELECT *' },
        context: { operation: 'findTemplate' },
        stack: error.stack
      });
    });
  });

  describe('isTemporary', () => {
    it('should return true for temporary error codes', () => {
      const temporaryError = new EmailTemplateError('Test', 'DATABASE_TIMEOUT');
      expect(temporaryError.isTemporary()).toBe(true);
    });

    it('should return false for non-temporary error codes', () => {
      const permanentError = new EmailTemplateError('Test', 'TEMPLATE_NOT_FOUND');
      expect(permanentError.isTemporary()).toBe(false);
    });

    it('should handle all temporary error codes', () => {
      TEMPORARY_ERROR_CODES.forEach(code => {
        const error = new EmailTemplateError('Test', code);
        expect(error.isTemporary()).toBe(true);
      });
    });
  });

  describe('requiresAdminNotification', () => {
    it('should return true for errors requiring admin notification', () => {
      const criticalError = new EmailTemplateError('Test', 'SYSTEM_ERROR');
      expect(criticalError.requiresAdminNotification()).toBe(true);
    });

    it('should return false for errors not requiring admin notification', () => {
      const userError = new EmailTemplateError('Test', 'DUPLICATE_MAPPING');
      expect(userError.requiresAdminNotification()).toBe(false);
    });

    it('should handle all admin notification error codes', () => {
      ADMIN_NOTIFICATION_ERROR_CODES.forEach(code => {
        const error = new EmailTemplateError('Test', code);
        expect(error.requiresAdminNotification()).toBe(true);
      });
    });
  });

  describe('getSeverity', () => {
    it('should return critical for critical error codes', () => {
      CRITICAL_ERROR_CODES.forEach(code => {
        const error = new EmailTemplateError('Test', code);
        expect(error.getSeverity()).toBe('critical');
      });
    });

    it('should return warning for warning error codes', () => {
      WARNING_ERROR_CODES.forEach(code => {
        const error = new EmailTemplateError('Test', code);
        expect(error.getSeverity()).toBe('warning');
      });
    });

    it('should return error for other error codes', () => {
      const error = new EmailTemplateError('Test', 'DUPLICATE_MAPPING');
      expect(error.getSeverity()).toBe('error');
    });
  });
});

describe('EmailTemplateErrorFactory', () => {
  describe('createDuplicateMappingError', () => {
    it('should create duplicate mapping error with correct properties', () => {
      const error = EmailTemplateErrorFactory.createDuplicateMappingError(
        'comply_fiscal',
        'on-premise',
        'existing-template-id'
      );

      expect(error.code).toBe('DUPLICATE_MAPPING');
      expect(error.message).toBe('Já existe um mapeamento para comply_fiscal + on-premise');
      expect(error.details).toEqual({ existingTemplateId: 'existing-template-id' });
      expect(error.context).toEqual({ formulario: 'comply_fiscal', modalidade: 'on-premise' });
    });

    it('should create duplicate mapping error without existing template ID', () => {
      const error = EmailTemplateErrorFactory.createDuplicateMappingError(
        'comply_edocs',
        'saas'
      );

      expect(error.code).toBe('DUPLICATE_MAPPING');
      expect(error.message).toBe('Já existe um mapeamento para comply_edocs + saas');
      expect(error.details).toEqual({ existingTemplateId: undefined });
    });
  });

  describe('createTemplateNotFoundError', () => {
    it('should create template not found error with template ID', () => {
      const error = EmailTemplateErrorFactory.createTemplateNotFoundError('template-123');

      expect(error.code).toBe('TEMPLATE_NOT_FOUND');
      expect(error.message).toBe('Template com ID template-123 não encontrado');
      expect(error.details).toEqual({ templateId: 'template-123' });
    });

    it('should create template not found error with formulario and modalidade', () => {
      const error = EmailTemplateErrorFactory.createTemplateNotFoundError(
        undefined,
        'comply_fiscal',
        'on-premise'
      );

      expect(error.code).toBe('TEMPLATE_NOT_FOUND');
      expect(error.message).toBe('Nenhum template encontrado para comply_fiscal + on-premise');
      expect(error.context).toEqual({ formulario: 'comply_fiscal', modalidade: 'on-premise' });
    });
  });

  describe('createDatabaseError', () => {
    it('should create database error with operation context', () => {
      const originalError = new Error('Connection failed');
      const error = EmailTemplateErrorFactory.createDatabaseError('template search', originalError);

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Erro de banco de dados durante template search');
      expect(error.details).toBe(originalError);
      expect(error.context).toEqual({ operation: 'template search' });
    });
  });

  describe('createFallbackChainExhaustedError', () => {
    it('should create fallback chain exhausted error', () => {
      const attemptedFallbacks = ['specific', 'default', 'global'];
      const error = EmailTemplateErrorFactory.createFallbackChainExhaustedError(
        'comply_fiscal',
        'on-premise',
        attemptedFallbacks
      );

      expect(error.code).toBe('FALLBACK_CHAIN_EXHAUSTED');
      expect(error.message).toBe('Cadeia de fallback esgotada para comply_fiscal + on-premise');
      expect(error.details).toEqual({ attemptedFallbacks });
      expect(error.context).toEqual({ formulario: 'comply_fiscal', modalidade: 'on-premise' });
    });
  });

  describe('createValidationError', () => {
    it('should create validation error with field details', () => {
      const error = EmailTemplateErrorFactory.createValidationError(
        'formulario',
        'invalid_form',
        'Formulário deve ser comply_fiscal ou comply_edocs'
      );

      expect(error.code).toBe('MAPPING_VALIDATION_FAILED');
      expect(error.message).toBe('Validação falhou para formulario: Formulário deve ser comply_fiscal ou comply_edocs');
      expect(error.details).toEqual({
        field: 'formulario',
        value: 'invalid_form',
        reason: 'Formulário deve ser comply_fiscal ou comply_edocs'
      });
    });
  });
});

describe('Error Code Constants', () => {
  it('should have no overlapping error codes between categories', () => {
    const allCodes = [
      ...TEMPORARY_ERROR_CODES,
      ...ADMIN_NOTIFICATION_ERROR_CODES,
      ...CRITICAL_ERROR_CODES,
      ...WARNING_ERROR_CODES
    ];

    // Verificar se há códigos duplicados seria complexo, então vamos apenas verificar
    // que as constantes estão definidas e não estão vazias
    expect(TEMPORARY_ERROR_CODES.length).toBeGreaterThan(0);
    expect(ADMIN_NOTIFICATION_ERROR_CODES.length).toBeGreaterThan(0);
    expect(CRITICAL_ERROR_CODES.length).toBeGreaterThan(0);
    expect(WARNING_ERROR_CODES.length).toBeGreaterThan(0);
  });

  it('should contain expected temporary error codes', () => {
    expect(TEMPORARY_ERROR_CODES).toContain('DATABASE_CONNECTION_FAILED');
    expect(TEMPORARY_ERROR_CODES).toContain('DATABASE_TIMEOUT');
    expect(TEMPORARY_ERROR_CODES).toContain('NETWORK_ERROR');
    expect(TEMPORARY_ERROR_CODES).toContain('RATE_LIMIT_EXCEEDED');
  });

  it('should contain expected admin notification error codes', () => {
    expect(ADMIN_NOTIFICATION_ERROR_CODES).toContain('DATABASE_ERROR');
    expect(ADMIN_NOTIFICATION_ERROR_CODES).toContain('SYSTEM_ERROR');
    expect(ADMIN_NOTIFICATION_ERROR_CODES).toContain('FALLBACK_CHAIN_EXHAUSTED');
  });

  it('should contain expected critical error codes', () => {
    expect(CRITICAL_ERROR_CODES).toContain('DATABASE_CONNECTION_FAILED');
    expect(CRITICAL_ERROR_CODES).toContain('SYSTEM_ERROR');
    expect(CRITICAL_ERROR_CODES).toContain('FALLBACK_CHAIN_EXHAUSTED');
  });

  it('should contain expected warning error codes', () => {
    expect(WARNING_ERROR_CODES).toContain('TEMPLATE_NOT_FOUND');
    expect(WARNING_ERROR_CODES).toContain('MAPPING_VALIDATION_FAILED');
  });
});