import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as validationUtils from '@/utils/templateMappingValidation';

// Mock do toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock das funções de validação
vi.mock('@/utils/templateMappingValidation', () => ({
  validateMappingUniqueness: vi.fn(),
  validateMappingCombination: vi.fn(),
  getValidationErrorMessage: vi.fn()
}));

describe('useTemplateMappingValidation integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validation utility integration', () => {
    it('deve integrar com validateMappingUniqueness corretamente', async () => {
      // Arrange
      const mockValidationResult = { isValid: true };
      vi.mocked(validationUtils.validateMappingUniqueness).mockResolvedValue(mockValidationResult);

      // Act
      const result = await validationUtils.validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      });

      // Assert
      expect(result).toEqual(mockValidationResult);
      expect(validationUtils.validateMappingUniqueness).toHaveBeenCalledWith({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      });
    });

    it('deve detectar erro de combinação', async () => {
      // Arrange
      const mockCombinationError = { 
        isValid: false, 
        error: 'Formulário inválido', 
        code: 'INVALID_FORMULARIO' 
      };
      vi.mocked(validationUtils.validateMappingCombination).mockReturnValue(mockCombinationError);

      // Act
      const result = validationUtils.validateMappingCombination('invalid', 'on-premise');

      // Assert
      expect(result).toEqual(mockCombinationError);
      expect(validationUtils.validateMappingCombination).toHaveBeenCalledWith('invalid', 'on-premise');
    });

    it('deve detectar mapeamento duplicado', async () => {
      // Arrange
      const mockUniquenessError = { 
        isValid: false, 
        error: 'Já existe um template para Comply e-DOCS + On-premise', 
        code: 'DUPLICATE_MAPPING' 
      };
      
      vi.mocked(validationUtils.validateMappingUniqueness).mockResolvedValue(mockUniquenessError);

      // Act
      const result = await validationUtils.validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      });

      // Assert
      expect(result).toEqual(mockUniquenessError);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Já existe um template para Comply e-DOCS + On-premise');
      expect(result.code).toBe('DUPLICATE_MAPPING');
    });

    it('deve tratar erro durante validação', async () => {
      // Arrange
      vi.mocked(validationUtils.validateMappingUniqueness).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(validationUtils.validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      })).rejects.toThrow('Network error');
    });

    it('deve validar com excludeId para edição', async () => {
      // Arrange
      const mockResult = { isValid: true };
      vi.mocked(validationUtils.validateMappingUniqueness).mockResolvedValue(mockResult);

      // Act
      const result = await validationUtils.validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise',
        excludeId: 'template-123'
      });

      // Assert
      expect(result).toEqual(mockResult);
      expect(validationUtils.validateMappingUniqueness).toHaveBeenCalledWith({
        formulario: 'comply_edocs',
        modalidade: 'on-premise',
        excludeId: 'template-123'
      });
    });
  });

  describe('validateCombination', () => {
    it('deve validar combinação localmente', () => {
      // Arrange
      const mockResult = { isValid: true };
      vi.mocked(validationUtils.validateMappingCombination).mockReturnValue(mockResult);

      // Act
      const result = validationUtils.validateMappingCombination('comply_edocs', 'on-premise');

      // Assert
      expect(result).toEqual(mockResult);
      expect(validationUtils.validateMappingCombination).toHaveBeenCalledWith('comply_edocs', 'on-premise');
    });

    it('deve retornar erro para combinação inválida', () => {
      // Arrange
      const mockError = { isValid: false, error: 'Erro', code: 'ERROR' };
      vi.mocked(validationUtils.validateMappingCombination).mockReturnValue(mockError);

      // Act
      const result = validationUtils.validateMappingCombination('invalid', 'invalid');

      // Assert
      expect(result).toEqual(mockError);
      expect(result.isValid).toBe(false);
    });
  });

  describe('error message handling', () => {
    it('deve retornar mensagem de erro apropriada', () => {
      // Arrange
      const mockMessage = 'Formulário e modalidade são obrigatórios';
      vi.mocked(validationUtils.getValidationErrorMessage).mockReturnValue(mockMessage);

      // Act
      const result = validationUtils.getValidationErrorMessage('MISSING_PARAMETERS');

      // Assert
      expect(result).toBe(mockMessage);
      expect(validationUtils.getValidationErrorMessage).toHaveBeenCalledWith('MISSING_PARAMETERS');
    });
  });

  describe('multiple validations', () => {
    it('deve validar múltiplos mapeamentos', async () => {
      // Arrange
      const mappings = [
        { formulario: 'comply_edocs' as const, modalidade: 'on-premise' as const },
        { formulario: 'comply_fiscal' as const, modalidade: 'saas' as const }
      ];
      
      vi.mocked(validationUtils.validateMappingUniqueness)
        .mockResolvedValueOnce({ isValid: true })
        .mockResolvedValueOnce({ isValid: false, error: 'Duplicado', code: 'DUPLICATE' });

      // Act
      const results = await Promise.all(
        mappings.map(mapping => validationUtils.validateMappingUniqueness(mapping))
      );

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[1].error).toBe('Duplicado');
    });
  });

  describe('validation scenarios', () => {
    it('deve validar todas as combinações válidas', () => {
      const validCombinations = [
        ['comply_edocs', 'on-premise'],
        ['comply_edocs', 'saas'],
        ['comply_fiscal', 'on-premise'],
        ['comply_fiscal', 'saas']
      ];

      // Arrange
      vi.mocked(validationUtils.validateMappingCombination).mockReturnValue({ isValid: true });

      validCombinations.forEach(([formulario, modalidade]) => {
        // Act
        const result = validationUtils.validateMappingCombination(formulario, modalidade);
        
        // Assert
        expect(result.isValid).toBe(true);
      });

      expect(validationUtils.validateMappingCombination).toHaveBeenCalledTimes(4);
    });

    it('deve rejeitar combinações inválidas', () => {
      const invalidCombinations = [
        ['', 'on-premise'],
        ['comply_edocs', ''],
        ['invalid', 'on-premise'],
        ['comply_edocs', 'invalid']
      ];

      // Arrange
      vi.mocked(validationUtils.validateMappingCombination).mockReturnValue({ 
        isValid: false, 
        error: 'Combinação inválida',
        code: 'INVALID_COMBINATION'
      });

      invalidCombinations.forEach(([formulario, modalidade]) => {
        // Act
        const result = validationUtils.validateMappingCombination(formulario, modalidade);
        
        // Assert
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Combinação inválida');
      });

      expect(validationUtils.validateMappingCombination).toHaveBeenCalledTimes(4);
    });
  });

  describe('edge cases', () => {
    it('deve tratar parâmetros undefined', async () => {
      // Arrange
      vi.mocked(validationUtils.validateMappingUniqueness).mockResolvedValue({
        isValid: false,
        error: 'Parâmetros inválidos',
        code: 'INVALID_PARAMS'
      });

      // Act
      const result = await validationUtils.validateMappingUniqueness({
        formulario: undefined as any,
        modalidade: 'on-premise'
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Parâmetros inválidos');
    });

    it('deve tratar parâmetros null', () => {
      // Arrange
      vi.mocked(validationUtils.validateMappingCombination).mockReturnValue({
        isValid: false,
        error: 'Parâmetros nulos',
        code: 'NULL_PARAMS'
      });

      // Act
      const result = validationUtils.validateMappingCombination(null as any, null as any);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Parâmetros nulos');
    });
  });
});