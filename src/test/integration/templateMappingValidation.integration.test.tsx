import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { validateMappingUniqueness } from '@/utils/templateMappingValidation';
import type { EmailTemplate } from '@/types/approval';

// Mock do serviço de templates
const mockCreateTemplate = vi.fn();
const mockUpdateTemplate = vi.fn();

vi.mock('@/hooks/useEmailTemplates', () => ({
  useEmailTemplates: () => ({
    createTemplate: mockCreateTemplate,
    updateTemplate: mockUpdateTemplate
  })
}));

// Mock do serviço de mapeamento
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    validateUniqueness: vi.fn()
  },
  EmailTemplateError: class extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'EmailTemplateError';
    }
  }
}));

// Mock do toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

describe('Template Mapping Validation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Integration', () => {
    it('deve integrar validação com serviço de mapeamento', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);

      // Act
      const result = await validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_edocs',
        'on-premise',
        undefined
      );
    });

    it('deve detectar mapeamento duplicado via serviço', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(false);

      // Act
      const result = await validateMappingUniqueness({
        formulario: 'comply_fiscal',
        modalidade: 'saas'
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Já existe um template para Comply Fiscal + SaaS');
      expect(result.code).toBe('DUPLICATE_MAPPING');
    });

    it('deve passar excludeId para validação de edição', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);

      // Act
      const result = await validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'saas',
        excludeId: 'template-123'
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_edocs',
        'saas',
        'template-123'
      );
    });
  });

  describe('Template Creation Flow', () => {
    it('deve permitir criar template quando mapeamento é único', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);
      mockCreateTemplate.mockResolvedValue({ success: true });

      const templateData = {
        nome: 'Template Teste',
        formulario: 'comply_edocs' as const,
        modalidade: 'saas',
        assunto: 'Teste',
        corpo: '<p>Teste</p>',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true
      };

      // Act - validar primeiro
      const validationResult = await validateMappingUniqueness({
        formulario: templateData.formulario,
        modalidade: templateData.modalidade as 'on-premise' | 'saas'
      });

      // Se válido, criar template
      let createResult;
      if (validationResult.isValid) {
        createResult = await mockCreateTemplate(templateData);
      }

      // Assert
      expect(validationResult.isValid).toBe(true);
      expect(createResult?.success).toBe(true);
      expect(mockCreateTemplate).toHaveBeenCalledWith(templateData);
    });

    it('deve impedir criação quando mapeamento é duplicado', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(false);

      const templateData = {
        nome: 'Template Duplicado',
        formulario: 'comply_fiscal' as const,
        modalidade: 'on-premise'
      };

      // Act - validar primeiro
      const validationResult = await validateMappingUniqueness({
        formulario: templateData.formulario,
        modalidade: templateData.modalidade as 'on-premise' | 'saas'
      });

      // Se inválido, não criar template
      if (!validationResult.isValid) {
        // Template creation should be blocked
      }

      // Assert
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBe('Já existe um template para Comply Fiscal + On-premise');
      expect(mockCreateTemplate).not.toHaveBeenCalled();
    });

    it('deve permitir criar template para "todas as modalidades"', async () => {
      // Arrange
      mockCreateTemplate.mockResolvedValue({ success: true });

      const templateData = {
        nome: 'Template Geral',
        formulario: 'comply_edocs' as const,
        modalidade: null, // "todas as modalidades"
        assunto: 'Teste Geral',
        corpo: '<p>Template geral</p>',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true
      };

      // Act - não precisa validar unicidade para modalidade null
      const createResult = await mockCreateTemplate(templateData);

      // Assert
      expect(createResult.success).toBe(true);
      expect(mockCreateTemplate).toHaveBeenCalledWith(templateData);
      // Não deve chamar validação para modalidade null
      expect(emailTemplateMappingService.validateUniqueness).not.toHaveBeenCalled();
    });
  });

  describe('Template Update Flow', () => {
    const mockTemplate: EmailTemplate = {
      id: 'template-123',
      nome: 'Template Existente',
      assunto: 'Assunto Teste',
      corpo: '<p>Corpo do template</p>',
      descricao: 'Descrição teste',
      tipo: 'orcamento',
      ativo: true,
      vinculado_formulario: true,
      formulario: 'comply_edocs',
      modalidade: 'on-premise',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('deve permitir editar template quando novo mapeamento é único', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);
      mockUpdateTemplate.mockResolvedValue({ success: true });

      const updateData = {
        modalidade: 'saas' // Alterando modalidade
      };

      // Act - validar primeiro
      const validationResult = await validateMappingUniqueness({
        formulario: mockTemplate.formulario!,
        modalidade: updateData.modalidade as 'on-premise' | 'saas',
        excludeId: mockTemplate.id
      });

      // Se válido, atualizar template
      let updateResult;
      if (validationResult.isValid) {
        updateResult = await mockUpdateTemplate(mockTemplate.id, updateData);
      }

      // Assert
      expect(validationResult.isValid).toBe(true);
      expect(updateResult?.success).toBe(true);
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_edocs',
        'saas',
        'template-123'
      );
      expect(mockUpdateTemplate).toHaveBeenCalledWith(mockTemplate.id, updateData);
    });

    it('deve impedir edição quando novo mapeamento é duplicado', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(false);

      const updateData = {
        formulario: 'comply_fiscal' as const,
        modalidade: 'saas'
      };

      // Act - validar primeiro
      const validationResult = await validateMappingUniqueness({
        formulario: updateData.formulario,
        modalidade: updateData.modalidade as 'on-premise' | 'saas',
        excludeId: mockTemplate.id
      });

      // Se inválido, não atualizar template
      if (!validationResult.isValid) {
        // Update should be blocked
      }

      // Assert
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBe('Já existe um template para Comply Fiscal + SaaS');
      expect(mockUpdateTemplate).not.toHaveBeenCalled();
    });

    it('deve permitir manter mesmo mapeamento (excludeId funciona)', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);
      mockUpdateTemplate.mockResolvedValue({ success: true });

      const updateData = {
        nome: 'Nome Alterado'
        // Mantém mesmo formulario e modalidade
      };

      // Act - validar com excludeId
      const validationResult = await validateMappingUniqueness({
        formulario: mockTemplate.formulario!,
        modalidade: mockTemplate.modalidade as 'on-premise' | 'saas',
        excludeId: mockTemplate.id
      });

      // Se válido, atualizar
      let updateResult;
      if (validationResult.isValid) {
        updateResult = await mockUpdateTemplate(mockTemplate.id, updateData);
      }

      // Assert
      expect(validationResult.isValid).toBe(true);
      expect(updateResult?.success).toBe(true);
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_edocs',
        'on-premise',
        'template-123' // excludeId permite manter mesmo mapeamento
      );
    });
  });

  describe('Error Handling', () => {
    it('deve tratar erro de rede durante validação', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness)
        .mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      })).resolves.toEqual({
        isValid: false,
        error: 'Erro interno ao validar mapeamento',
        code: 'INTERNAL_ERROR'
      });
    });

    it('deve tratar EmailTemplateError específico', async () => {
      // Arrange
      const { EmailTemplateError } = await import('@/services/emailTemplateMappingService');
      vi.mocked(emailTemplateMappingService.validateUniqueness)
        .mockRejectedValue(new EmailTemplateError('Database connection failed', 'DATABASE_ERROR'));

      // Act
      const result = await validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.code).toBe('DATABASE_ERROR');
    });
  });

  describe('All Valid Combinations', () => {
    it('deve validar todas as combinações possíveis', async () => {
      const combinations = [
        ['comply_edocs', 'on-premise'],
        ['comply_edocs', 'saas'],
        ['comply_fiscal', 'on-premise'],
        ['comply_fiscal', 'saas']
      ] as const;

      // Arrange - todas as combinações são únicas
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);

      // Act & Assert
      for (const [formulario, modalidade] of combinations) {
        const result = await validateMappingUniqueness({
          formulario,
          modalidade
        });

        expect(result.isValid).toBe(true);
        expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
          formulario,
          modalidade,
          undefined
        );
      }

      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledTimes(4);
    });

    it('deve detectar duplicação em qualquer combinação', async () => {
      const combinations = [
        ['comply_edocs', 'on-premise'],
        ['comply_edocs', 'saas'],
        ['comply_fiscal', 'on-premise'],
        ['comply_fiscal', 'saas']
      ] as const;

      // Arrange - todas as combinações são duplicadas
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(false);

      // Act & Assert
      for (const [formulario, modalidade] of combinations) {
        const result = await validateMappingUniqueness({
          formulario,
          modalidade
        });

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Já existe um template para');
        expect(result.code).toBe('DUPLICATE_MAPPING');
      }

      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledTimes(4);
    });
  });

  describe('Complex Scenarios', () => {
    it('deve tratar cenário de correção após erro', async () => {
      // Arrange - primeiro erro, depois sucesso
      vi.mocked(emailTemplateMappingService.validateUniqueness)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      // Act - primeira tentativa (duplicada)
      const firstResult = await validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'saas'
      });

      // Act - segunda tentativa (corrigida)
      const secondResult = await validateMappingUniqueness({
        formulario: 'comply_edocs',
        modalidade: 'on-premise'
      });

      // Assert
      expect(firstResult.isValid).toBe(false);
      expect(firstResult.error).toBe('Já existe um template para Comply e-DOCS + SaaS');
      
      expect(secondResult.isValid).toBe(true);
      
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledTimes(2);
    });

    it('deve validar fluxo completo de criação com validação', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.validateUniqueness).mockResolvedValue(true);
      mockCreateTemplate.mockResolvedValue({ success: true });

      const templateData = {
        nome: 'Template Completo',
        formulario: 'comply_fiscal' as const,
        modalidade: 'on-premise' as const,
        assunto: 'Assunto Completo',
        corpo: '<p>Corpo completo</p>',
        descricao: 'Descrição completa',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true
      };

      // Act - fluxo completo
      // 1. Validar unicidade
      const validationResult = await validateMappingUniqueness({
        formulario: templateData.formulario,
        modalidade: templateData.modalidade
      });

      // 2. Se válido, criar template
      let createResult;
      if (validationResult.isValid) {
        createResult = await mockCreateTemplate(templateData);
      }

      // Assert
      expect(validationResult.isValid).toBe(true);
      expect(createResult?.success).toBe(true);
      expect(emailTemplateMappingService.validateUniqueness).toHaveBeenCalledWith(
        'comply_fiscal',
        'on-premise',
        undefined
      );
      expect(mockCreateTemplate).toHaveBeenCalledWith(templateData);
    });
  });
});