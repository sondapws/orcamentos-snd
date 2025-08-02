import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateMappingUniqueness, 
  validateMultipleMappings,
  validateMappingCombination,
  getValidationErrorMessage,
  type MappingValidationOptions 
} from '@/utils/templateMappingValidation';
import { emailTemplateMappingService, EmailTemplateError } from '@/services/emailTemplateMappingService';

// Mock do serviço
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    validateUniqueness: vi.fn()
  },
  EmailTemplateError: class extends Error {
    constructor(message: string, public code: string, public details?: any) {
      super(message);
      this.name = 'EmailTemplateError';
    }
  }
}));

describe('templateMappingValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateMappingUniqueness', () => {
    it('deve validar mapeamento único com sucesso', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      };
      
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.code).toBeUndefined();
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_edocs',
        'on-premise',
        undefined
      );
    });

    it('deve detectar mapeamento duplicado', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'comply_fiscal',
        modalidade: 'saas'
      };
      
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(false);

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Já existe um template para Comply Fiscal + SaaS');
      expect(result.code).toBe('DUPLICATE_MAPPING');
    });

    it('deve validar com excludeId para edição', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'comply_edocs',
        modalidade: 'saas',
        excludeId: 'template-123'
      };
      
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(true);
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_edocs',
        'saas',
        'template-123'
      );
    });

    it('deve retornar erro para parâmetros faltando', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: '' as any,
        modalidade: 'on-premise'
      };

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formulário e modalidade são obrigatórios');
      expect(result.code).toBe('MISSING_PARAMETERS');
      expect(emailTemplateMappingService.validateUniqueness).not.toHaveBeenCalled();
    });

    it('deve retornar erro para formulário inválido', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'invalid_form' as any,
        modalidade: 'on-premise'
      };

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formulário inválido. Valores permitidos: comply_edocs, comply_fiscal');
      expect(result.code).toBe('INVALID_FORMULARIO');
    });

    it('deve retornar erro para modalidade inválida', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'comply_edocs',
        modalidade: 'invalid_mode' as any
      };

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Modalidade inválida. Valores permitidos: on-premise, saas');
      expect(result.code).toBe('INVALID_MODALIDADE');
    });

    it('deve tratar EmailTemplateError', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      };
      
      const templateError = new EmailTemplateError('Database connection failed', 'DATABASE_ERROR');
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockRejectedValue(templateError);

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.code).toBe('DATABASE_ERROR');
    });

    it('deve tratar erro genérico', async () => {
      // Arrange
      const options: MappingValidationOptions = {
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      };
      
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockRejectedValue(new Error('Generic error'));

      // Act
      const result = await validateMappingUniqueness(options);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Erro interno ao validar mapeamento');
      expect(result.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('validateMultipleMappings', () => {
    it('deve validar múltiplos mapeamentos', async () => {
      // Arrange
      const mappings: MappingValidationOptions[] = [
        { formulario: 'comply_edocs', modalidade: 'on-premise' },
        { formulario: 'comply_fiscal', modalidade: 'saas' }
      ];
      
      vi.mocked(emailTemplateMappingService.validateUniqueness)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      // Act
      const results = await validateMultipleMappings(mappings);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[1].error).toBe('Já existe um template para Comply Fiscal + SaaS');
    });

    it('deve retornar array vazio para entrada vazia', async () => {
      // Act
      const results = await validateMultipleMappings([]);

      // Assert
      expect(results).toHaveLength(0);
    });
  });

  describe('validateMappingCombination', () => {
    it('deve validar combinação válida', () => {
      // Act
      const result = validateMappingCombination('comply_edocs', 'on-premise');

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.code).toBeUndefined();
    });

    it('deve rejeitar formulário vazio', () => {
      // Act
      const result = validateMappingCombination('', 'on-premise');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formulário e modalidade são obrigatórios');
      expect(result.code).toBe('MISSING_PARAMETERS');
    });

    it('deve rejeitar modalidade vazia', () => {
      // Act
      const result = validateMappingCombination('comply_edocs', '');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formulário e modalidade são obrigatórios');
      expect(result.code).toBe('MISSING_PARAMETERS');
    });

    it('deve rejeitar formulário inválido', () => {
      // Act
      const result = validateMappingCombination('invalid_form', 'on-premise');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formulário inválido');
      expect(result.code).toBe('INVALID_FORMULARIO');
    });

    it('deve rejeitar modalidade inválida', () => {
      // Act
      const result = validateMappingCombination('comply_edocs', 'invalid_mode');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Modalidade inválida');
      expect(result.code).toBe('INVALID_MODALIDADE');
    });

    it('deve validar todas as combinações válidas', () => {
      const validCombinations = [
        ['comply_edocs', 'on-premise'],
        ['comply_edocs', 'saas'],
        ['comply_fiscal', 'on-premise'],
        ['comply_fiscal', 'saas']
      ];

      validCombinations.forEach(([formulario, modalidade]) => {
        const result = validateMappingCombination(formulario, modalidade);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('getValidationErrorMessage', () => {
    it('deve retornar mensagens corretas para códigos conhecidos', () => {
      const testCases = [
        ['MISSING_PARAMETERS', 'Formulário e modalidade são obrigatórios'],
        ['INVALID_FORMULARIO', 'Selecione um formulário válido'],
        ['INVALID_MODALIDADE', 'Selecione uma modalidade válida'],
        ['DUPLICATE_MAPPING', 'Já existe um template para esta combinação'],
        ['DATABASE_ERROR', 'Erro ao acessar o banco de dados'],
        ['INTERNAL_ERROR', 'Erro interno do sistema']
      ];

      testCases.forEach(([code, expectedMessage]) => {
        expect(getValidationErrorMessage(code)).toBe(expectedMessage);
      });
    });

    it('deve retornar mensagem padrão para código desconhecido', () => {
      const result = getValidationErrorMessage('UNKNOWN_ERROR');
      expect(result).toBe('Erro de validação desconhecido');
    });
  });
});